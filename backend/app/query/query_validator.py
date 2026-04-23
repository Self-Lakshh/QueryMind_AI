import re

DANGEROUS_KEYWORDS = ["DROP", "DELETE", "INSERT", "UPDATE", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE"]

def is_select_query(sql):
    """Checks if the query is a SELECT statement."""
    return sql.strip().upper().startswith("SELECT")

def contains_dangerous_keywords(sql):
    """Checks for destructive SQL keywords."""
    sql_upper = sql.upper()
    for kw in DANGEROUS_KEYWORDS:
        if re.search(rf'\b{kw}\b', sql_upper):
            return True, kw
    return False, None

def validate_tables_exist(sql, schema_dict):
    """Validates that all tables in the SQL exist in the schema."""
    tables_in_schema = set(t.upper() for t in schema_dict.get("tables", {}).keys())
    # Simple regex to find tables after FROM or JOIN
    tables_in_sql = re.findall(r'\b(?:FROM|JOIN)\s+([a-zA-Z_0-9]+)', sql, re.IGNORECASE)
    
    for table in tables_in_sql:
        if table.upper() not in tables_in_schema:
            return False, f"Table '{table}' not found in schema"
    return True, None

def validate_columns_exist(sql, schema_dict):
    """Placeholder for column validation (complex to do without full parser)."""
    # For now, we assume true if table exists, as deep column parsing requires a SQL parser
    return True, None

def full_validate(sql, schema_dict):
    """Performs all validations."""
    if not is_select_query(sql):
        return {"valid": False, "error": "Only SELECT queries are allowed"}
    
    dangerous, kw = contains_dangerous_keywords(sql)
    if dangerous:
        return {"valid": False, "error": f"Dangerous keyword '{kw}' detected"}
    
    tables_ok, err = validate_tables_exist(sql, schema_dict)
    if not tables_ok:
        return {"valid": False, "error": err}
        
    return {"valid": True, "error": None}
