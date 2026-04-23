import os
from huggingface_hub import HfApi, create_repo, login

PROMPTS_DIR = os.path.join("ai", "data", "prompts")

def main():
    token = input("Enter your HuggingFace token: ")
    username = input("Enter your HuggingFace username: ")
    
    # Login
    try:
        login(token=token)
        print("Successfully logged into HuggingFace.")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    repo_id = f"{username}/querymind-data"
    
    # Create repo if not exists
    api = HfApi()
    try:
        create_repo(repo_id=repo_id, repo_type="dataset", exist_ok=True)
        print(f"Repo {repo_id} is ready.")
    except Exception as e:
        print(f"Error creating/accessing repo: {e}")
        return

    # Upload files
    files_to_upload = {
        "train.jsonl": os.path.join(PROMPTS_DIR, "train.jsonl"),
        "val.jsonl": os.path.join(PROMPTS_DIR, "val.jsonl"),
        "test.jsonl": os.path.join(PROMPTS_DIR, "test.jsonl"),
    }

    print("Uploading files...")
    for repo_path, local_path in files_to_upload.items():
        if os.path.exists(local_path):
            print(f"  Uploading {repo_path}...")
            api.upload_file(
                path_or_fileobj=local_path,
                path_in_repo=repo_path,
                repo_id=repo_id,
                repo_type="dataset",
            )
        else:
            print(f"  Warning: {local_path} not found.")

    print("\n" + "="*30)
    print("HF UPLOAD COMPLETE")
    print("="*30)
    print(f"URL: https://huggingface.co/datasets/{repo_id}")
    print(f"Paste this into Colab Cell 1: HF_USERNAME = '{username}'")
    print("="*30)

if __name__ == "__main__":
    main()
