import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    # 1. Health
    try:
        res = requests.get(f"{base_url}/")
        print(f"GET /health: {'PASS' if res.status_code == 200 else 'FAIL'}")
    except:
        print("GET /health: FAIL (Connection error)")

    # 2. Schema Paste
    schema_payload = {
        "name": "test_schema",
        "text": "CREATE TABLE users (id INT, name TEXT); CREATE TABLE orders (id INT, user_id INT);"
    }
    try:
        res = requests.post(f"{base_url}/api/v1/schema/paste", json=schema_payload)
        data = res.json()
        tables = data.get("tables", [])
        print(f"POST /schema/paste: {'PASS' if 'users' in tables and 'orders' in tables else 'FAIL'}")
    except Exception as e:
        print(f"POST /schema/paste: FAIL ({str(e)})")

    # 3. Validate Safe
    validate_payload = {
        "sql": "SELECT name FROM users",
        "schema_name": "test_schema"
    }
    try:
        res = requests.post(f"{base_url}/api/v1/query/validate", json=validate_payload)
        data = res.json()
        print(f"POST /query/validate (Safe): {'PASS' if data.get('valid') == True else 'FAIL'}")
    except:
        print("POST /query/validate (Safe): FAIL")

    # 4. Validate Dangerous
    dangerous_payload = {
        "sql": "DROP TABLE users",
        "schema_name": "test_schema"
    }
    try:
        res = requests.post(f"{base_url}/api/v1/query/validate", json=dangerous_payload)
        data = res.json()
        print(f"POST /query/validate (Dangerous): {'PASS' if data.get('valid') == False else 'FAIL'}")
    except:
        print("POST /query/validate (Dangerous): FAIL")

    # 5. Execute
    execute_payload = {
        "sql": "SELECT 1 as test",
        "schema_name": "test_schema"
    }
    try:
        res = requests.post(f"{base_url}/api/v1/query/execute", json=execute_payload)
        data = res.json()
        print(f"POST /query/execute: {'PASS' if 'columns' in data else 'FAIL'}")
    except:
        print("POST /query/execute: FAIL")

if __name__ == "__main__":
    test_api()
