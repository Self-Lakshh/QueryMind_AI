import os
import json

# Setup paths
SPLITS_DIR = os.path.join("ai", "data", "splits")
PROMPTS_DIR = os.path.join("ai", "data", "prompts")
os.makedirs(PROMPTS_DIR, exist_ok=True)

SYSTEM_PROMPT = "You are QueryMind, an expert SQL generation engine. Given a database schema and a natural language question, you produce a single correct optimized SQL query. Rules: (1) Use ONLY tables and columns present in the provided schema. (2) Never use SELECT * — always name specific columns. (3) Prefer JOINs using foreign keys over subqueries. (4) Add LIMIT 100 if the query may return many rows. (5) Output ONLY the SQL query — no explanation, no markdown, no preamble, no trailing semicolon."

def build_prompts():
    splits = ["train.jsonl", "val.jsonl", "test.jsonl"]
    
    for split_file in splits:
        input_path = os.path.join(SPLITS_DIR, split_file)
        output_path = os.path.join(PROMPTS_DIR, split_file)
        
        print(f"Building prompts for {split_file}...")
        
        valid_count = 0
        invalid_count = 0
        
        with open(input_path, 'r', encoding='utf-8') as f_in, \
             open(output_path, 'w', encoding='utf-8') as f_out:
            
            for line in f_in:
                if not line.strip(): continue
                sample = json.loads(line)
                
                schema_str = sample.get('schema_str', '')
                question = sample.get('question', '')
                sql = sample.get('query', '')
                
                # USER MESSAGE
                user_content = f"Schema:\n{schema_str}\n\nQuestion: {question}"
                
                # ASSISTANT MESSAGE
                assistant_content = sql
                
                # Construct OpenAI format
                prompt_record = {
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                        {"role": "assistant", "content": assistant_content}
                    ]
                }
                
                # Validation
                is_valid = True
                if len(prompt_record["messages"]) != 3: is_valid = False
                if prompt_record["messages"][0]["role"] != "system": is_valid = False
                if prompt_record["messages"][1]["role"] != "user": is_valid = False
                if prompt_record["messages"][2]["role"] != "assistant": is_valid = False
                
                if not assistant_content.strip().upper().startswith("SELECT"):
                    is_valid = False
                
                if is_valid:
                    f_out.write(json.dumps(prompt_record) + "\n")
                    valid_count += 1
                else:
                    invalid_count += 1
        
        print(f"  - {split_file}: Total Valid: {valid_count} | Total Invalid: {invalid_count}")

    # Final Summary for train.jsonl sample
    train_path = os.path.join(PROMPTS_DIR, "train.jsonl")
    print("\n" + "="*30)
    print("SAMPLE PROMPTS (FIRST 3 RECORDS FROM TRAIN)")
    print("="*30)
    try:
        with open(train_path, 'r', encoding='utf-8') as f:
            for i in range(3):
                line = f.readline()
                if line:
                    print(f"RECORD {i+1}:")
                    print(json.dumps(json.loads(line), indent=2))
                    print("-" * 20)
    except Exception as e:
        print(f"Error reading sample: {e}")
    print("="*30)

if __name__ == "__main__":
    build_prompts()
