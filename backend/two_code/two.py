import ast
from difflib import SequenceMatcher

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

def combined_similarity(file1_path, file2_path):
    code1 = open(file1_path).read()
    code2 = open(file2_path).read()

    ast_score = compare_ast_similarity(code1, code2)
    token_score = compare_token_similarity(code1, code2)
    avg_score = round((ast_score + token_score) / 2, 2)

    matches = get_matching_blocks(code1, code2)
    copied_parts = []
    for match in matches:
        i, j, size = match
        if size > 10:
            part = code1[i:i+size]
            copied_parts.append(part)

    return {
        "ast_similarity": round(ast_score, 2),
        "token_similarity": round(token_score, 2),
        "final_similarity": avg_score,
        "copied_sections": copied_parts
    }


result = combined_similarity(
    "C:/Users/papur/Desktop/H/CodePlager/backend/two_code/s1.py",
    "C:/Users/papur/Desktop/H/CodePlager/backend/two_code/s3.py"
)

print("Similarity Summary:", result["final_similarity"], "%")
print("Copied Code Sections:")
for section in result["copied_sections"]:
    print("-" * 30)
    print(section)
