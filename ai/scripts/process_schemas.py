import os
import json
import logging
import re

# Setup paths
PROCESSED_DIR = os.path.join("ai", "data", "processed")
RAW_DIR = os.path.join("ai", "data", "raw")
ERROR_LOG = os.path.join(PROCESSED_DIR, "schema_errors.log")

os.makedirs(PROCESSED_DIR, exist_ok=True)

# Setup logging
logging.basicConfig(
    filename=ERROR_LOG,
    level=logging.ERROR,
    format="%(asctime)s - %(message)s",
    filemode='w'
)

def load_spider_tables(file_path):
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found.")
        return {}
    with open(file_path, 'r', encoding='utf-8') as f:
        tables = json.load(f)
    return {t['db_id']: t for t in tables}

def get_spider_schema_str(db_id, table_data):
    if not table_data:
        return f"Database: {db_id}", True
    
    tables = table_data.get('table_names_original', [])
    columns = table_data.get('column_names_original', []) # list of [table_index, column_name]
    
    table_to_cols = {i: [] for i in range(len(tables))}
    for col_idx, (tbl_idx, col_name) in enumerate(columns):
        if tbl_idx == -1: continue # * column or metadata
        if tbl_idx < len(tables):
            table_to_cols[tbl_idx].append(col_name)
    
    table_strs = []
    for i, table_name in enumerate(tables):
        cols = ",".join(table_to_cols[i])
        table_strs.append(f"{table_name}({cols})")
    
    fk_strs = []
    if 'foreign_keys' in table_data:
        for fk in table_data['foreign_keys']:
            if len(fk) == 2:
                c1_idx, c2_idx = fk
                if c1_idx < len(columns) and c2_idx < len(columns):
                    t1_idx, c1_name = columns[c1_idx]
                    t2_idx, c2_name = columns[c2_idx]
                    if t1_idx < len(tables) and t2_idx < len(tables):
                        t1_name = tables[t1_idx]
                        t2_name = tables[t2_idx]
                        fk_strs.append(f"{t1_name}.{c1_name}→{t2_name}.{c2_name}")
            
    schema_str = f"Database: {db_id} | Tables: {', '.join(table_strs)}"
    if fk_strs:
        schema_str += f" | FK: {', '.join(fk_strs)}"
        
    return schema_str, False

def get_wikisql_schema_str(sample):
    # WikiSQL usually has a 'table' key with 'header' and 'id'
    table = sample.get('table')
    if not table:
        return f"Database: {sample.get('db_id', 'unknown')}", True
    
    db_id = table.get('id', 'unknown')
    header = table.get('header', [])
    schema_str = f"Database: {db_id} | Tables: table({','.join(header)})"
    return schema_str, False

def extract_tables_from_sql(sql):
    # Very basic regex-based table extraction
    # Looks for words after FROM or JOIN
    tables = re.findall(r'\b(?:FROM|JOIN)\s+([a-zA-Z_0-9]+)', sql, re.IGNORECASE)
    return set(t.upper() for t in tables)

def extract_schema_from_instruction(instruction):
    # Pattern: <|context|>[...]
    match = re.search(r'<\|context\|>(\[.*?\])<\|endoftext\|>', instruction, re.DOTALL)
    if not match:
        return None, None
    
    try:
        context_data = json.loads(match.group(1))
        table_strs = []
        db_id = "extracted_from_context"
        
        for item in context_data:
            t_name = item.get('name', 'unknown')
            cols = item.get('columns', [])
            table_strs.append(f"{t_name}({','.join(cols)})")
        
        schema_str = f"Database: {db_id} | Tables: {', '.join(table_strs)}"
        return schema_str, False
    except Exception as e:
        return None, None

def process():
    tables_map = load_spider_tables(os.path.join(RAW_DIR, "spider_tables.json"))
    files = [f for f in os.listdir(RAW_DIR) if f.endswith(".jsonl")]
    
    overall_stats = {}

    for filename in files:
        dataset_name = filename.split('_')[0].lower()
        print(f"Processing {filename}...")
        
        input_path = os.path.join(RAW_DIR, filename)
        output_path = os.path.join(PROCESSED_DIR, filename.replace(".jsonl", "_enriched.jsonl"))
        
        full_schemas = 0
        missing_schemas = 0
        
        with open(input_path, 'r', encoding='utf-8') as f_in, \
             open(output_path, 'w', encoding='utf-8') as f_out:
            
            for line in f_in:
                if not line.strip(): continue
                sample = json.loads(line)
                db_id = sample.get('db_id')
                instruction = sample.get('instruction')
                
                schema_str = None
                is_missing = True
                
                if dataset_name == 'wikisql':
                    schema_str, is_missing = get_wikisql_schema_str(sample)
                elif db_id and db_id in tables_map:
                    schema_str, is_missing = get_spider_schema_str(db_id, tables_map[db_id])
                elif instruction:
                    schema_str, is_missing = extract_schema_from_instruction(instruction)
                
                if not schema_str:
                    schema_str = f"Database: {db_id or 'unknown'}"
                    is_missing = True
                
                sample['schema_str'] = schema_str
                if is_missing:
                    sample['schema_missing'] = True
                    missing_schemas += 1
                else:
                    sample['schema_missing'] = False
                    full_schemas += 1
                    
                    # Validation: Check if SQL tables are in schema
                    if dataset_name != 'wikisql' and db_id and db_id in tables_map:
                        query = sample.get('query', '')
                        sql_tables = extract_tables_from_sql(query)
                        known_tables = set(t.upper() for t in tables_map[db_id].get('table_names_original', []))
                        
                        for t in sql_tables:
                            if t not in known_tables:
                                logging.error(f"File: {filename} | DB: {db_id} | Table '{t}' used in SQL not found in schema. SQL: {query}")

                f_out.write(json.dumps(sample) + "\n")
        
        overall_stats[filename] = {"full": full_schemas, "missing": missing_schemas}

    print("\n" + "="*30)
    print("SCHEMA EXTRACTION SUMMARY")
    print("="*30)
    for filename, s in overall_stats.items():
        total = s['full'] + s['missing']
        perc = (s['full'] / total * 100) if total > 0 else 0
        print(f"{filename:<25} | Full: {s['full']:>6} | Missing: {s['missing']:>4} | Coverage: {perc:>6.2f}%")
    print("="*30)
    print(f"Errors logged to: {ERROR_LOG}")

if __name__ == "__main__":
    process()
