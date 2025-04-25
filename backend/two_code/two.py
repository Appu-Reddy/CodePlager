from flask import Flask, request, jsonify
import ast
from difflib import SequenceMatcher

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

if __name__ == '__main__':
    app.run(debug=True)