from flask import Flask, request, jsonify
import ast
from difflib import SequenceMatcher
from werkzeug.utils import secure_filename
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch
import re
import os
import tempfile
import zipfile
import shutil


app = Flask(__name__)

from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def get_ast_node_types(code_text):
    try:
        tree = ast.parse(code_text)
        return [type(node).__name__ for node in ast.walk(tree)]
    except:
        return []

def get_token_stream(code_text):
    return code_text.replace('\n', '').replace('\t', '').replace(' ', '')

def compare_ast_similarity(code1, code2):
    nodes1 = get_ast_node_types(code1)
    nodes2 = get_ast_node_types(code2)
    return SequenceMatcher(None, nodes1, nodes2).ratio() * 100

def compare_token_similarity(code1, code2):
    tokens1 = get_token_stream(code1)
    tokens2 = get_token_stream(code2)
    return SequenceMatcher(None, tokens1, tokens2).ratio() * 100

def get_matching_blocks(code1, code2):
    sm = SequenceMatcher(None, code1, code2)
    return sm.get_matching_blocks()

def combined_similarity(code1, code2):
    ast_score = compare_ast_similarity(code1, code2)
    token_score = compare_token_similarity(code1, code2)
    avg_score = round((ast_score + token_score) / 2, 2)

    matches = get_matching_blocks(code1, code2)
    copied_parts = []
    for match in matches:
        i, j, size = match
        if size > 20:
            part = code1[i:i+size]
            copied_parts.append(part)

    return {
        "ast_similarity": round(ast_score, 2),
        "token_similarity": round(token_score, 2),
        "final_similarity": avg_score,
        "copied_sections" : copied_parts,
    }

@app.route('/')
def check_active():
    return jsonify({"status":"active"}), 200

@app.route('/compare', methods=['POST'])
def compare_files():
    if 'file1' not in request.files or 'file2' not in request.files:
        return jsonify({"error": "Both files are required"}), 400

    file1 = request.files['file1'].read().decode('utf-8')
    file2 = request.files['file2'].read().decode('utf-8')

    result = combined_similarity(file1, file2)
    return jsonify(result)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'py', 'java', 'js', 'cpp', 'c', 'go', 'rs'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Model configuration
MODEL_NAME = "Salesforce/codet5p-770m"
AI_THRESHOLD = 0.5  # Use probability comparison instead of hard threshold

# Initialize model
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained("Salesforce/codet5p-770m")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    detector = pipeline("text-classification", model=model, tokenizer=tokenizer, device=0 if torch.cuda.is_available() else -1)
except Exception as e:
    print(f"Model loading failed: {str(e)}")
    raise SystemExit("Failed to initialize model")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_code(code):
    """Clean code before detection"""
    if not code:
        return ""
    
    # Remove comments
    code = re.sub(r'#.*?\n', '\n', code)  # Python
    code = re.sub(r'\/\/.*?\n', '\n', code)  # Java/C++
    code = re.sub(r'\/\*.*?\*\/', '', code, flags=re.DOTALL)  # Multi-line
    
    # Normalize formatting
    code = '\n'.join([line.strip() for line in code.split('\n') if line.strip()])
    return code

def detect_ai_code(code):
    """Detect AI-generated code with confidence scores"""
    if not code.strip():
        return {
            "ai_prob": 0.0,
            "human_prob": 0.0,
            "is_ai_generated": False,
            "error": "Empty code content"
        }
    
    try:
        clean_code = preprocess_code(code)
        if not clean_code.strip():
            return {
                "ai_prob": 0.0,
                "human_prob": 0.0,
                "is_ai_generated": False,
                "error": "No code content after preprocessing"
            }

        result = detector(clean_code, truncation=True, max_length=512)[0]

        # Dynamically infer label assignment
        label = result['label']
        score = result['score']
        if label in ['LABEL_1', 'AI', 'generated']:
            human_prob = 1-score
            ai_prob = score
        else:
            human_prob =score
            ai_prob = 1-score

        # Decision based on higher probability
        is_ai = ai_prob >= human_prob

        return {
            "ai_prob": round(ai_prob, 4),
            "human_prob": round(human_prob, 4),
            "is_ai_generated": is_ai,
            "error": None
        }
    except Exception as e:
        print(f"Detection error: {str(e)}")
        return {
            "ai_prob": 0.0,
            "human_prob": 0.0,
            "is_ai_generated": False,
            "error": str(e)
        }

@app.route('/detect', methods=['POST'])
def detect_code():
    # Initialize variables
    code = ""
    filename = "direct_input"
    error = None

    # Handle file upload
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({'error': 'Invalid filename'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            with open(filepath, 'r', encoding='utf-8') as f:
                code = f.read()
        except UnicodeDecodeError:
            try:
                with open(filepath, 'r', encoding='latin-1') as f:
                    code = f.read()
            except Exception as e:
                error = f"Could not read file: {str(e)}"
        except Exception as e:
            error = f"File handling error: {str(e)}"
        finally:
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass

    # Handle direct code input
    elif request.is_json:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': 'No code provided in JSON'}), 400
        code = data['code']
    else:
        return jsonify({'error': 'Unsupported content type'}), 400

    if error:
        return jsonify({'error': error}), 400

    # Perform detection
    detection = detect_ai_code(code)
    if detection['error']:
        return jsonify({'error': detection['error']}), 500

    return jsonify({
        'filename': filename,
        'detection_result': {
            'ai_prob': detection['ai_prob'],
            'human_prob': detection['human_prob'],
            'is_ai_generated': detection['is_ai_generated']
        },
        'verdict': "AI-generated code" if detection['is_ai_generated'] else "Human-written code",
        'confidence': max(detection['ai_prob'], detection['human_prob'])
    })

app.config['MAX_CONTENT_LENGTH'] = 350 * 1024 * 1024  # 350MB limit
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
detector = pipeline("text-classification", model=model, tokenizer=tokenizer, device=0 if torch.cuda.is_available() else -1)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_code(code):
    code = re.sub(r'#.*?\n', '\n', code)
    code = re.sub(r'\/\/.*?\n', '\n', code)
    code = re.sub(r'\/\*.*?\*\/', '', code, flags=re.DOTALL)
    return '\n'.join([line.strip() for line in code.split('\n') if line.strip()])

def detect_ai_code(code):
    if not code.strip():
        return {"ai_prob": 0.0, "human_prob": 0.0, "is_ai_generated": False, "error": "Empty code"}

    try:
        clean_code = preprocess_code(code)
        if not clean_code.strip():
            return {"ai_prob": 0.0, "human_prob": 0.0, "is_ai_generated": False, "error": "No content after cleaning"}

        result = detector(clean_code, truncation=True, max_length=512)[0]
        label, score = result['label'], result['score']
        if label in ['LABEL_1', 'AI', 'generated']:
            ai_prob, human_prob = score, 1 - score
        else:
            ai_prob, human_prob = 1 - score, score

        return {
            "ai_prob": round(ai_prob, 4),
            "human_prob": round(human_prob, 4),
            "is_ai_generated": ai_prob >= human_prob,
            "error": None
        }
    except Exception as e:
        return {"ai_prob": 0.0, "human_prob": 0.0, "is_ai_generated": False, "error": str(e)}

@app.route('/detect-zip', methods=['POST'])
def detect_zip():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.endswith('.zip'):
        return jsonify({'error': 'File must be a ZIP archive'}), 400

    temp_dir = tempfile.mkdtemp()
    try:
        zip_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(zip_path)

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        code_results = []
        total_code = ''
        for root, _, files in os.walk(temp_dir):
            for fname in files:
                if allowed_file(fname):
                    path = os.path.join(root, fname)
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except UnicodeDecodeError:
                        with open(path, 'r', encoding='latin-1') as f:
                            content = f.read()

                    result = detect_ai_code(content)
                    if result['error']:
                        continue

                    total_code += '\n' + content
                    code_results.append({
                        "filename": fname,
                        "ai_prob": result["ai_prob"],
                        "human_prob": result["human_prob"],
                        "is_ai_generated": result["is_ai_generated"]
                    })

        if not code_results:
            return jsonify({'error': 'No valid code files found in ZIP'}), 400

        overall_result = detect_ai_code(total_code)
        if overall_result['error']:
            return jsonify({'error': overall_result['error']}), 500

        return jsonify({
            "files_analyzed": len(code_results),
            "file_results": code_results,
            "detection_result": {
                "ai_prob": overall_result["ai_prob"],
                "human_prob": overall_result["human_prob"],
                "is_ai_generated": overall_result["is_ai_generated"]
            },
            "verdict": "AI-generated code" if overall_result["is_ai_generated"] else "Human-written code",
            "confidence": max(overall_result["ai_prob"], overall_result["human_prob"])
        })

    except Exception as e:
        return jsonify({'error': f"Error processing ZIP file: {str(e)}"}), 500
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == '__main__':
    app.run(debug=True,port=1234)