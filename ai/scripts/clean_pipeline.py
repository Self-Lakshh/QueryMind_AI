import os
import json
import re
import hashlib
import random
import logging

# Setup paths
PROCESSED_DIR = os.path.join("ai", "data", "processed")
SPLITS_DIR = os.path.join("ai", "data", "splits")
CLEAN_LOG = os.path.join(PROCESSED_DIR, "clean_pipeline.log")

os.makedirs(SPLITS_DIR, exist_ok=True)

# SQL Keywords for normalization
SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING", 
    "LIMIT", "DISTINCT", "COUNT", "SUM", "AVG", "MAX", "MIN", "AS", "AND", "OR", 
    "NOT", "IN", "IS NULL", "BETWEEN", "LIKE", "CASE", "WHEN", "THEN", "ELSE", 
    "END", "UNION", "WITH", "INNER", "LEFT", "RIGHT", "OUTER"
]

DANGEROUS_KEYWORDS = ["DROP", "DELETE", "INSERT", "UPDATE", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE"]

def normalize_sql(sql, schema_str):
    if not sql:
        return ""
    
    # Uppercase keywords
    # Use word boundaries to avoid replacing parts of column names
    for kw in SQL_KEYWORDS:
        pattern = re.compile(rf'\b{kw}\b', re.IGNORECASE)
        sql = pattern.sub(kw, sql)
    
    # Remove trailing semicolons
    sql = sql.strip().rstrip(';')
    
    # Collapse whitespace
    sql = " ".join(sql.split())
    
    # Handle SELECT *
    if "SELECT *" in sql:
        # Extract all columns from schema_str
        # Format: Database: {db_id} | Tables: {t1}({col1,col2}), {t2}({col3,col4})
        match = re.search(r'Tables: (.*?)(?: \| FK:|$)', schema_str)
        if match:
            tables_part = match.group(1)
            # Find everything inside parentheses
            all_cols = []
            col_matches = re.findall(r'\((.*?)\)', tables_part)
            for cm in col_matches:
                all_cols.extend([c.strip() for c in cm.split(',')])
            
            if all_cols:
                cols_str = ", ".join(sorted(list(set(all_cols))))
                sql = sql.replace("SELECT *", f"SELECT {cols_str}")
    
    return sql

def extract_all_cols(schema_str):
    match = re.search(r'Tables: (.*?)(?: \| FK:|$)', schema_str)
    if not match: return []
    tables_part = match.group(1)
    all_cols = []
    col_matches = re.findall(r'\((.*?)\)', tables_part)
    for cm in col_matches:
        all_cols.extend([c.strip() for c in cm.split(',')])
    return sorted(list(set(all_cols)))

def is_dangerous(sql):
    sql_upper = sql.upper()
    for kw in DANGEROUS_KEYWORDS:
        if re.search(rf'\b{kw}\b', sql_upper):
            return True
    return False

def process_pipeline():
    enriched_files = [f for f in os.listdir(PROCESSED_DIR) if f.endswith("_enriched.jsonl")]
    
    all_samples = []
    stats = {
        "before": 0,
        "removed_dupes": 0,
        "removed_quality": 0,
        "removed_select_star": 0
    }
    
    dupe_hashes = set()
    dataset_dupes = {}

    for filename in enriched_files:
        dataset_name = filename.split('_')[0]
        dataset_dupes[dataset_name] = 0
        print(f"Cleaning {filename}...")
        
        file_path = os.path.join(PROCESSED_DIR, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip(): continue
                stats["before"] += 1
                sample = json.loads(line)
                
                db_id = sample.get('db_id', 'unknown')
                question = sample.get('question', '')
                sql_raw = sample.get('query', '') or sample.get('sql', '') # handle different keys
                schema_str = sample.get('schema_str', '')
                
                # STEP A - Normalize
                norm_sql = normalize_sql(sql_raw, schema_str)
                
                # Check if SELECT * still exists
                if "SELECT *" in norm_sql:
                    stats["removed_select_star"] += 1
                    continue
                
                # STEP C - Quality filter
                if len(question) < 5:
                    stats["removed_quality"] += 1
                    continue
                if len(norm_sql) < 10:
                    stats["removed_quality"] += 1
                    continue
                if is_dangerous(norm_sql):
                    stats["removed_quality"] += 1
                    continue
                if not schema_str or sample.get('schema_missing'):
                    stats["removed_quality"] += 1
                    continue
                
                # STEP B - Deduplicate
                hash_input = f"{db_id}|{question}|{norm_sql}"
                h = hashlib.md5(hash_input.encode('utf-8')).hexdigest()
                
                if h in dupe_hashes:
                    stats["removed_dupes"] += 1
                    dataset_dupes[dataset_name] += 1
                    continue
                
                dupe_hashes.add(h)
                
                # Update sample
                sample['query'] = norm_sql
                all_samples.append(sample)

    # Print dupe stats per dataset
    print("\nDuplicates removed per dataset:")
    for ds, count in dataset_dupes.items():
        print(f"  {ds}: {count}")

    # STEP D - Merge & Shuffle
    random.seed(42)
    random.shuffle(all_samples)
    
    total_cleaned = len(all_samples)
    
    # STEP E - Split 70/15/15
    train_end = int(total_cleaned * 0.7)
    val_end = train_end + int(total_cleaned * 0.15)
    
    train_set = all_samples[:train_end]
    val_set = all_samples[train_end:val_end]
    test_set = all_samples[val_end:]
    
    def save_jsonl(data, filename):
        path = os.path.join(SPLITS_DIR, filename)
        with open(path, 'w', encoding='utf-8') as f:
            for item in data:
                f.write(json.dumps(item) + "\n")
        return len(data)

    n_train = save_jsonl(train_set, "train.jsonl")
    n_val = save_jsonl(val_set, "val.jsonl")
    n_test = save_jsonl(test_set, "test.jsonl")
    
    print("\n" + "="*30)
    print("CLEANING PIPELINE SUMMARY")
    print("="*30)
    print(f"Before cleaning: {stats['before']} samples")
    print(f"After cleaning:  {total_cleaned} samples")
    print(f"Total removed:   {stats['before'] - total_cleaned}")
    print(f"  - Duplicates:   {stats['removed_dupes']}")
    print(f"  - Quality/Empty:{stats['removed_quality']}")
    print(f"  - SELECT * Fail:{stats['removed_select_star']}")
    print("-" * 30)
    print(f"Train: {n_train} | Val: {n_val} | Test: {n_test}")
    print("="*30)

if __name__ == "__main__":
    process_pipeline()
