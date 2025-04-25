from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
from werkzeug.utils import secure_filename
import traceback
import ast
from difflib import SequenceMatcher
from itertools import combinations
from collections import defaultdict


app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = '../uploads/assignments'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


def get_ast_node_types(code_text):
    try:
        tree = ast.parse(code_text)
        return [type(node).__name__ for node in ast.walk(tree)]
    except:
        return []


def get_token_stream(code_text):
    return code_text.replace('\n', '').replace('\t', '').replace(' ', '')


def compare_ast(code1, code2):
    nodes1 = get_ast_node_types(code1)
    nodes2 = get_ast_node_types(code2)
    return SequenceMatcher(None, nodes1, nodes2).ratio() * 100


def compare_tokens(code1, code2):
    t1 = get_token_stream(code1)
    t2 = get_token_stream(code2)
    return SequenceMatcher(None, t1, t2).ratio() * 100


def load_code(path):
    with open(path, 'r', encoding='utf-8') as file:
        return file.read()


def compare_all_submissions(folder_path, threshold=50):
    files = [f for f in os.listdir(folder_path)]
    matches = []
    leaderboard_counter = defaultdict(int)

    for f1, f2 in combinations(files, 2):
        code1 = load_code(os.path.join(folder_path, f1))
        code2 = load_code(os.path.join(folder_path, f2))

        ast_score = compare_ast(code1, code2)
        token_score = compare_tokens(code1, code2)
        avg_similarity = round((ast_score + token_score) / 2, 2)

        if avg_similarity >= threshold:
            matches.append({
                "student_1": f1,
                "student_2": f2,
                "similarity_percent": avg_similarity
            })
            leaderboard_counter[f1] += 1
            leaderboard_counter[f2] += 1

    leaderboard = sorted(
        [{"student": student, "sim_count": count}
        for student, count in leaderboard_counter.items()],
        key=lambda x: x["sim_count"],
        reverse=True
    )

    return {
        "matches": matches,
        "leaderboard": leaderboard
    }


@app.route('/api/codes', methods=['GET'])
def send_codes():
    try:
        files = os.listdir(UPLOAD_FOLDER)
        submissions = []

        for file in files:
            parts = file.split('_')
            if len(parts) == 3:
                student_name = parts[0]
                student_id = parts[1]
                filename = parts[2]
                submissions.append({
                    'name': student_name,
                    'id': student_id,
                    'filename': filename
                })

        return jsonify(submissions), 200

    except Exception as e:
        app.logger.error(f"Error in send_codes: {str(e)}")
        return jsonify({'error': 'Failed to retrieve submissions'}), 500


@app.route('/api/download', methods=['GET'])
def download_file():
    try:
        # Get the requested file from query parameters
        file_name = request.args.get('file')
        
        if not file_name:
            return jsonify({'error': 'No file specified'}), 400
        
        # For security, ensure the filename doesn't contain path traversal attempts
        secure_file = secure_filename(file_name)
        
        # Check if file exists
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_file)
        if not os.path.exists(file_path):
            return jsonify({'error': f'File not found: {secure_file}'}), 404
        
        # Extract the original filename (the part after the last underscore)
        parts = secure_file.split('_')
        original_filename = parts[2] if len(parts) >= 3 else secure_file
        
        # Set the mimetype to text/plain for code files
        # You can expand this to handle different file types if needed
        return send_from_directory(
            app.config['UPLOAD_FOLDER'], 
            secure_file,
            as_attachment=True,
            download_name=original_filename,
            mimetype='text/plain'
        )
        
    except Exception as e:
        app.logger.error(f"Error in download_file: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Failed to download file', 'details': str(e)}), 500


@app.route('/api/run', methods=['POST'])
def run_plagiarism_check():
    try:
        results = compare_all_submissions(UPLOAD_FOLDER)
        return jsonify(results), 200
    except Exception as e:
        app.logger.error(f"Error in run_plagiarism_check: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Server error during plagiarism check', 'details': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=4321)











# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import time
# from werkzeug.utils import secure_filename
# import traceback
# import ast
# from difflib import SequenceMatcher
# from itertools import combinations
# from collections import defaultdict


# app = Flask(__name__)
# CORS(app)


# UPLOAD_FOLDER = '../uploads/assignments'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


# def get_ast_node_types(code_text):
#     try:
#         tree = ast.parse(code_text)
#         return [type(node).__name__ for node in ast.walk(tree)]
#     except:
#         return []


# def get_token_stream(code_text):
#     return code_text.replace('\n', '').replace('\t', '').replace(' ', '')


# def compare_ast(code1, code2):
#     nodes1 = get_ast_node_types(code1)
#     nodes2 = get_ast_node_types(code2)
#     return SequenceMatcher(None, nodes1, nodes2).ratio() * 100


# def compare_tokens(code1, code2):
#     t1 = get_token_stream(code1)
#     t2 = get_token_stream(code2)
#     return SequenceMatcher(None, t1, t2).ratio() * 100


# def load_code(path):
#     with open(path, 'r', encoding='utf-8') as file:
#         return file.read()


# def compare_all_submissions(folder_path, threshold=50):
#     files = [f for f in os.listdir(folder_path)]
#     matches = []
#     leaderboard_counter = defaultdict(int)

#     for f1, f2 in combinations(files, 2):
#         code1 = load_code(os.path.join(folder_path, f1))
#         code2 = load_code(os.path.join(folder_path, f2))

#         ast_score = compare_ast(code1, code2)
#         token_score = compare_tokens(code1, code2)
#         avg_similarity = round((ast_score + token_score) / 2, 2)

#         if avg_similarity >= threshold:
#             matches.append({
#                 "student_1": f1,
#                 "student_2": f2,
#                 "similarity_percent": avg_similarity
#             })
#             leaderboard_counter[f1] += 1
#             leaderboard_counter[f2] += 1

#     leaderboard = sorted(
#         [{"student": student, "sim_count": count}
#         for student, count in leaderboard_counter.items()],
#         key=lambda x: x["sim_count"],
#         reverse=True
#     )

#     return {
#         "matches": matches,
#         "leaderboard": leaderboard
#     }


# @app.route('/api/codes', methods=['GET'])
# def send_codes():
#     try:
#         files = os.listdir(UPLOAD_FOLDER)
#         submissions = []

#         for file in files:
#             parts = file.split('_')
#             if len(parts) == 3:
#                 student_name = parts[0]
#                 student_id = parts[1]
#                 filename = parts[2]
#                 submissions.append({
#                     'name': student_name,
#                     'id': student_id,
#                     'filename': filename
#                 })

#         return jsonify(submissions), 200

#     except Exception as e:
#         app.logger.error(f"Error in send_codes: {str(e)}")
#         return jsonify({'error': 'Failed to retrieve submissions'}), 500


# @app.route('/api/run', methods=['POST'])
# def run_plagiarism_check():
#     try:
#         results = compare_all_submissions(UPLOAD_FOLDER)
#         return jsonify(results), 200
#     except Exception as e:
#         app.logger.error(f"Error in run_plagiarism_check: {str(e)}")
#         app.logger.error(traceback.format_exc())
#         return jsonify({'error': 'Server error during plagiarism check', 'details': str(e)}), 500


# @app.route('/api/health', methods=['GET'])
# def health_check():
#     return jsonify({'status': 'ok'}), 200


# if __name__ == '__main__':
#     app.run(debug=True, port=4321)