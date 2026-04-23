import requests
import sqlite3
import os
import time

def setup_test_db():
    db_path = "backend/querymind.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(200), price DECIMAL, category VARCHAR(100));")
    cursor.execute("CREATE TABLE sales (id INT PRIMARY KEY, product_id INT, quantity INT, sale_date DATE, FOREIGN KEY (product_id) REFERENCES products(id));")
    
    # Insert sample data
    cursor.execute("INSERT INTO products VALUES (1, 'Laptop', 1000, 'Tech');")
    cursor.execute("INSERT INTO products VALUES (2, 'Mouse', 20, 'Tech');")
    cursor.execute("INSERT INTO products VALUES (3, 'Phone', 500, 'Tech');")
    
    cursor.execute("INSERT INTO sales VALUES (1, 1, 10, '2023-01-01');")
    cursor.execute("INSERT INTO sales VALUES (2, 2, 50, '2023-01-02');")
    cursor.execute("INSERT INTO sales VALUES (3, 3, 30, '2023-01-03');")
    
    conn.commit()
    conn.close()
    print("Test DB Setup: OK")

def run_e2e_tests():
    base_url = "http://localhost:8000/api/v1"
    results = []

    # --- JOURNEY 1 ---
    print("\nRunning Journey 1: Full Pipeline...")
    
    # Step 1: Paste Schema
    schema_text = """
    CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(200), price DECIMAL, category VARCHAR(100));
    CREATE TABLE sales (id INT PRIMARY KEY, product_id INT, quantity INT, sale_date DATE, FOREIGN KEY (product_id) REFERENCES products(id));
    """
    res = requests.post(f"{base_url}/schema/paste", json={"name": "e2e_schema", "text": schema_text})
    if res.status_code == 200 and "products" in res.json()["tables"]:
        results.append(["J1 S1: Paste Schema", "PASS", "Tables: products, sales detected"])
    else:
        results.append(["J1 S1: Paste Schema", "FAIL", f"Status: {res.status_code}"])

    # Step 2: Generate SQL
    gen_payload = {"question": "What are the top 3 products by total sales quantity?", "schema_name": "e2e_schema"}
    res = requests.post(f"{base_url}/query/generate", json=gen_payload)
    sql = ""
    if res.status_code == 200:
        sql = res.json().get("sql", "").upper()
        # Checks: SELECT, no SELECT *, JOIN or subquery, LIMIT
        passed = "SELECT" in sql and "*" not in sql and ("JOIN" in sql or "FROM SALES" in sql) and "LIMIT" in sql
        results.append(["J1 S2: Generate SQL", "PASS" if passed else "FAIL", f"SQL: {sql[:50]}..."])
    else:
        results.append(["J1 S2: Generate SQL", "FAIL", f"Status: {res.status_code}"])

    # Step 3: Validate SQL
    if sql:
        res = requests.post(f"{base_url}/query/validate", json={"sql": sql, "schema_name": "e2e_schema"})
        valid = res.json().get("valid")
        results.append(["J1 S3: Validate SQL", "PASS" if valid else "FAIL", f"Valid: {valid}"])
    else:
        results.append(["J1 S3: Validate SQL", "FAIL", "No SQL generated"])

    # Step 4: Execute SQL
    if sql:
        res = requests.post(f"{base_url}/query/execute", json={"sql": sql, "schema_name": "e2e_schema"})
        data = res.json()
        passed = "columns" in data and len(data.get("rows", [])) > 0
        results.append(["J1 S4: Execute SQL", "PASS" if passed else "FAIL", f"Rows: {len(data.get('rows', []))}"])
    else:
        results.append(["J1 S4: Execute SQL", "FAIL", "No SQL to execute"])

    # --- JOURNEY 2 ---
    print("\nRunning Journey 2: Security...")
    
    # DROP
    res = requests.post(f"{base_url}/query/validate", json={"sql": "DROP TABLE products", "schema_name": "e2e_schema"})
    passed = res.json().get("valid") == False and "SELECT" in res.json().get("error", "").upper()
    results.append(["J2 S1: Reject DROP", "PASS" if passed else "FAIL", f"Error: {res.json().get('error')}"])

    # DELETE
    res = requests.post(f"{base_url}/query/validate", json={"sql": "DELETE FROM products WHERE id=1", "schema_name": "e2e_schema"})
    passed = res.json().get("valid") == False
    results.append(["J2 S2: Reject DELETE", "PASS" if passed else "FAIL", "Blocked as expected"])

    # --- JOURNEY 3 ---
    print("\nRunning Journey 3: Single Table...")
    
    # Paste Simple Schema
    res = requests.post(f"{base_url}/schema/paste", json={"name": "simple", "text": "CREATE TABLE users (id INT, name TEXT);"})
    gen_payload = {"question": "List all user names", "schema_name": "simple"}
    res = requests.post(f"{base_url}/query/generate", json=gen_payload)
    if res.status_code == 200:
        sql = res.json().get("sql", "").upper()
        passed = "JOIN" not in sql
        results.append(["J3 S1: No JOIN needed", "PASS" if passed else "FAIL", f"SQL: {sql[:30]}"])
    else:
        results.append(["J3 S1: No JOIN needed", "FAIL", "Generation failed"])

    # --- PRINT SUMMARY ---
    print("\n" + "="*80)
    print(f"{'Step':<30} | {'Status':<10} | {'Notes'}")
    print("-" * 80)
    for step, status, note in results:
        print(f"{step:<30} | {status:<10} | {note}")
    print("="*80)

if __name__ == "__main__":
    setup_test_db()
    run_e2e_tests()
