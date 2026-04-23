import re
import json

def parse_schema_sql(sql_text):
    """Parses SQL CREATE TABLE statements into a dictionary."""
    tables = {}
    # Extract CREATE TABLE blocks
    table_matches = re.findall(r'CREATE\s+TABLE\s+([a-zA-Z_0-9]+)\s*\((.*?)\);', sql_text, re.DOTALL | re.IGNORECASE)
    
    for table_name, columns_part in table_matches:
        cols = []
        # Extract column names (simplified)
        col_lines = columns_part.split(',')
        for line in col_lines:
            line = line.strip()
            if not line: continue
            col_match = re.match(r'^([a-zA-Z_0-9]+)', line)
            if col_match:
                cols.append(col_match.group(1))
        tables[table_name] = cols
    
    return {"tables": tables, "raw_sql": sql_text}

def parse_schema_json(data):
    """Parses JSON schema into a dictionary."""
    if isinstance(data, str):
        data = json.loads(data)
    # Assume format like {"table1": ["col1", "col2"]} or list of objects
    return {"tables": data}

def parse_schema_text(text):
    """Auto-detects format and parses."""
    text = text.strip()
    if text.startswith('{') or text.startswith('['):
        return parse_schema_json(text)
    elif "CREATE TABLE" in text.upper():
        return parse_schema_sql(text)
    else:
        # Simple text format: table1(col1,col2), table2(col3)
        tables = {}
        matches = re.findall(r'([a-zA-Z_0-9]+)\s*\((.*?)\)', text)
        for t_name, cols_str in matches:
            tables[t_name] = [c.strip() for c in cols_str.split(',')]
        return {"tables": tables}

def extract_tables(schema):
    """Returns list of table names."""
    return list(schema.get("tables", {}).keys())

def extract_columns(schema):
    """Returns dict of table_name: columns."""
    return schema.get("tables", {})

def detect_primary_keys(schema):
    """Mock detection (assumes 'id' is PK if exists)."""
    pks = {}
    for table, cols in schema.get("tables", {}).items():
        if "id" in [c.lower() for c in cols]:
            pks[table] = "id"
    return pks

def detect_foreign_keys(schema):
    """Detects foreign keys from explicit SQL statements or naming conventions."""
    fks = []
    tables = extract_tables(schema)
    raw_sql = schema.get("raw_sql", "").upper()
    
    # 1. Parse explicit FOREIGN KEY clauses
    # Pattern: FOREIGN KEY (col) REFERENCES table(ref_col)
    fk_matches = re.findall(r'FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s+([a-zA-Z_0-9]+)\s*\((.*?)\)', raw_sql, re.IGNORECASE)
    for col, ref_table, ref_col in fk_matches:
        # We need to find which table this FK belongs to. 
        # This is simplified; in a real parser we'd know the context.
        # Here we just look at the raw SQL blocks.
        fks.append(f"{col.strip()} \u2192 {ref_table.strip()}.{ref_col.strip()}")

    # 2. Heuristic: check for table_id patterns
    for table, cols in schema.get("tables", {}).items():
        for col in cols:
            for other_table in tables:
                if other_table != table:
                    # check for user_id -> users.id or users_id -> users.id
                    singular = other_table.lower().rstrip('s')
                    patterns = [f"{other_table.lower()}_id", f"{singular}_id"]
                    if col.lower() in patterns:
                        fk_str = f"{table}.{col} \u2192 {other_table}.id"
                        if fk_str not in fks:
                            fks.append(fk_str)
    return fks

def build_schema_dictionary(schema):
    """Builds a unified schema dictionary."""
    schema_dict = {
        "tables": extract_columns(schema),
        "primary_keys": detect_primary_keys(schema),
        "foreign_keys": detect_foreign_keys(schema)
    }
    schema_dict["schema_str"] = schema_to_text(schema_dict)
    return schema_dict

def schema_to_text(schema_dict):
    """Converts schema dict to compact one-line format."""
    table_strs = []
    for t_name, cols in schema_dict.get("tables", {}).items():
        table_strs.append(f"{t_name}({','.join(cols)})")
    
    fk_str = f" | FK: {', '.join(schema_dict.get('foreign_keys', []))}" if schema_dict.get('foreign_keys') else ""
    return f"Tables: {', '.join(table_strs)}{fk_str}"
