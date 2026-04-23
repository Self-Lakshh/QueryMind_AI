import pytest
import json
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schema import schema_parser
from app.query import query_validator, query_executor

# Sample Schema for Tests
SAMPLE_SQL = """
CREATE TABLE users (id INTEGER PRIMARY KEY, name VARCHAR(100), email VARCHAR(200));
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, total DECIMAL, FOREIGN KEY (user_id) REFERENCES users(id));
"""

# --- SCHEMA PARSER TESTS ---

def test_parse_sql_tables():
    parsed = schema_parser.parse_schema_sql(SAMPLE_SQL)
    tables = schema_parser.extract_tables(parsed)
    assert "users" in tables
    assert "orders" in tables

def test_parse_sql_columns():
    parsed = schema_parser.parse_schema_sql(SAMPLE_SQL)
    cols = schema_parser.extract_columns(parsed)
    assert "name" in cols["users"]
    assert "total" in cols["orders"]

def test_parse_primary_keys():
    parsed = schema_parser.parse_schema_sql(SAMPLE_SQL)
    pks = schema_parser.detect_primary_keys(parsed)
    assert pks["users"] == "id"
    assert pks["orders"] == "id"

def test_parse_foreign_keys():
    parsed = schema_parser.parse_schema_sql(SAMPLE_SQL)
    fks = schema_parser.detect_foreign_keys(parsed)
    # Based on our simple regex/logic in schema_parser.py
    assert any("orders.user_id \u2192 users.id" in fk for fk in fks)

def test_auto_detect_json():
    json_input = json.dumps({"test_table": ["col1", "col2"]})
    parsed = schema_parser.parse_schema_text(json_input)
    assert "test_table" in parsed["tables"]

def test_schema_to_text():
    schema_dict = {
        "tables": {"users": ["id", "name"]},
        "foreign_keys": ["orders.user_id \u2192 users.id"]
    }
    text = schema_parser.schema_to_text(schema_dict)
    assert "Tables: users(id,name)" in text
    assert "FK: orders.user_id \u2192 users.id" in text

# --- VALIDATOR TESTS ---

def test_select_valid():
    assert query_validator.is_select_query("SELECT * FROM users") is True

def test_drop_invalid():
    assert query_validator.is_select_query("DROP TABLE users") is False

def test_delete_invalid():
    assert query_validator.is_select_query("DELETE FROM users") is False

def test_insert_invalid():
    assert query_validator.is_select_query("INSERT INTO users VALUES (1)") is False

def test_dangerous_drop():
    dangerous, kw = query_validator.contains_dangerous_keywords("DROP TABLE users")
    assert dangerous is True
    assert kw == "DROP"

def test_dangerous_delete():
    dangerous, kw = query_validator.contains_dangerous_keywords("DELETE FROM users")
    assert dangerous is True
    assert kw == "DELETE"

def test_safe_select_no_danger():
    dangerous, kw = query_validator.contains_dangerous_keywords("SELECT name FROM users")
    assert dangerous is False

def test_full_validate_pass():
    schema_dict = {"tables": {"users": ["id", "name"]}}
    result = query_validator.full_validate("SELECT name FROM users", schema_dict)
    assert result["valid"] is True

# --- EXECUTOR TESTS ---

def test_add_limit_missing():
    sql = "SELECT * FROM users"
    limited = query_executor.executor.add_limit_if_missing(sql, 50)
    assert "LIMIT 50" in limited

def test_no_double_limit():
    sql = "SELECT * FROM users LIMIT 10"
    limited = query_executor.executor.add_limit_if_missing(sql, 50)
    assert limited.count("LIMIT") == 1
    assert "LIMIT 10" in limited

def test_cost_low():
    cost = query_executor.executor.estimate_query_cost("SELECT * FROM users WHERE id = 1")
    assert cost == "LOW"

def test_cost_high():
    cost = query_executor.executor.estimate_query_cost("SELECT * FROM users JOIN orders ON users.id = orders.user_id")
    assert cost == "MEDIUM" # 1 join is MEDIUM in our logic

def test_cost_very_high():
    cost = query_executor.executor.estimate_query_cost("SELECT * FROM a JOIN b ON a.id = b.id JOIN c ON b.id = c.id JOIN d ON c.id = d.id")
    assert cost == "HIGH"

# --- LIVE API TESTS ---

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_schema_paste():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"name": "test_schema", "text": "Users(id, name)"}
        response = await ac.post("/api/v1/schema/paste", json=payload)
        assert response.status_code == 200
        assert "Users" in response.json()["tables"]
