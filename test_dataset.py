import json
import os

def validate_dataset():
    splits_path = "ai/data/splits/train.jsonl"
    prompts_path = "ai/data/prompts/train.jsonl"
    
    if not os.path.exists(splits_path):
        print(f"Dataset: FAIL - {splits_path} missing")
        return
    
    with open(splits_path, 'r', encoding='utf-8') as f:
        splits_count = sum(1 for _ in f)
    
    if splits_count < 1000:
        print(f"Dataset: FAIL - {splits_count} records (too few)")
        return

    if not os.path.exists(prompts_path):
        print(f"Dataset: FAIL - {prompts_path} missing")
        return

    valid_prompts = True
    with open(prompts_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                messages = data.get("messages", [])
                if len(messages) != 3:
                    valid_prompts = False
                    break
                roles = [m.get("role") for m in messages]
                if roles != ["system", "user", "assistant"]:
                    valid_prompts = False
                    break
            except:
                valid_prompts = False
                break
    
    if valid_prompts:
        print(f"Dataset: PASS - {splits_count} records")
    else:
        print(f"Dataset: FAIL - Invalid prompt format")

if __name__ == "__main__":
    validate_dataset()
