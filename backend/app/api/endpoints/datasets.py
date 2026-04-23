from fastapi import APIRouter
import os
import json

router = APIRouter()

PROCESSED_DIR = os.path.join("ai", "data", "processed")

@router.get("/")
async def list_datasets():
    """List all enriched datasets available in the processed directory."""
    if not os.path.exists(PROCESSED_DIR):
        return {"error": "Processed directory not found", "datasets": []}
    
    files = [f for f in os.listdir(PROCESSED_DIR) if f.endswith("_enriched.jsonl")]
    datasets = []
    for f in files:
        datasets.append({
            "name": f.replace("_enriched.jsonl", ""),
            "filename": f,
            "path": os.path.join(PROCESSED_DIR, f)
        })
    
    return {"datasets": datasets}

@router.get("/{dataset_name}/stats")
async def get_dataset_stats(dataset_name: str):
    """Get basic statistics for a specific enriched dataset."""
    filename = f"{dataset_name}_enriched.jsonl"
    file_path = os.path.join(PROCESSED_DIR, filename)
    
    if not os.path.exists(file_path):
        return {"error": "Dataset not found"}
    
    count = 0
    missing_schema = 0
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            count += 1
            sample = json.loads(line)
            if sample.get('schema_missing'):
                missing_schema += 1
                
    return {
        "dataset": dataset_name,
        "total_samples": count,
        "schema_coverage": f"{((count - missing_schema) / count * 100):.2f}%" if count > 0 else "0%"
    }
