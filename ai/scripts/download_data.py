import os
import json
from datasets import load_dataset
import pandas as pd

def download_datasets():
    # Ensure directory exists relative to project root
    RAW_DATA_DIR = os.path.join("ai", "data", "raw")
    os.makedirs(RAW_DATA_DIR, exist_ok=True)

    # These are the most common paths.
    datasets_to_load = [
        {"name": "spider", "path": "spider"},
        {"name": "wikisql", "path": "fka/wikisql"}, # Trying a more modern/parquet version
        {"name": "cosql", "path": "karlen532/cosql"},
        {"name": "sparc", "path": "aherntech/sparc"}
    ]

    summary_data = []

    for ds_info in datasets_to_load:
        name = ds_info["name"]
        path = ds_info["path"]
        
        print(f"\n--- Processing {name} (path: {path}) ---")
        dataset = None
        
        # Try standard load
        try:
            print(f"Attempting load for {path}...")
            dataset = load_dataset(path)
        except Exception as e:
            print(f"Load failed for {path}: {e}")
            # Fallback if needed
            if name == "wikisql":
                alt_wikisql = "b-rodriguez/wikisql"
                print(f"Trying alternative WikiSQL: {alt_wikisql}")
                try:
                    dataset = load_dataset(alt_wikisql)
                except:
                    pass

        if dataset:
            try:
                splits = list(dataset.keys())
                split_counts = {split: len(dataset[split]) for split in splits}
                
                # Save as jsonl
                for split in splits:
                    print(f"Saving split {split} ({split_counts[split]} samples)...")
                    output_file = os.path.join(RAW_DATA_DIR, f"{name}_{split}.jsonl")
                    with open(output_file, 'w', encoding='utf-8') as f:
                        for item in dataset[split]:
                            f.write(json.dumps(item) + "\n")

                # Print 1 example keys
                first_split = splits[0]
                example = dataset[first_split][0]
                print(f"Example keys: {list(example.keys())}")

                summary_data.append({
                    "Dataset": name,
                    "Train": split_counts.get("train", "N/A"),
                    "Val": split_counts.get("validation", split_counts.get("dev", "N/A")),
                    "Test": split_counts.get("test", "N/A"),
                    "Keys Available": ", ".join(list(example.keys()))
                })
            except Exception as e_proc:
                print(f"Error processing {name}: {e_proc}")
        else:
            summary_data.append({
                "Dataset": name,
                "Train": "FAILED",
                "Val": "FAILED",
                "Test": "FAILED",
                "Keys Available": "N/A"
            })

    # Summary Table
    if summary_data:
        df = pd.DataFrame(summary_data)
        print("\nSummary Table:")
        try:
            print(df.to_markdown(index=False))
        except:
            print(df.to_string(index=False))

if __name__ == "__main__":
    download_datasets()
