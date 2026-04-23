import os
import time
import json
import logging
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_ID = os.getenv("HF_MODEL_ID")
VERSION = os.getenv("MODEL_VERSION", "0.1.0")

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("QueryMindInference")

app = FastAPI(
    title="QueryMind AI Inference Server",
    version=VERSION
)

class GenerateRequest(BaseModel):
    question: str
    schema_str: str
    schema_info: dict

def build_prompt(schema_str, question):
    """Formats the input into the exact fine-tuned prompt structure."""
    system_prompt = (
        "You are QueryMind, an expert SQL generation engine. Given a database schema and a natural language question, "
        "you produce a single correct optimized SQL query. Rules: (1) Use ONLY tables and columns present in the provided schema. "
        "(2) Never use SELECT * — always name specific columns. (3) Prefer JOINs using foreign keys over subqueries. "
        "(4) Add LIMIT 100 if the query may return many rows. (5) Output ONLY the SQL query — no explanation, no markdown, "
        "no preamble, no trailing semicolon."
    )
    return f"<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\nSchema:\n{schema_str}\n\nQuestion: {question} [/INST]"

def call_hf_api(prompt):
    """Calls HuggingFace Inference API with timeout."""
    if not HF_TOKEN or not HF_MODEL_ID:
        return "ERROR: HF_TOKEN or HF_MODEL_ID not configured"
    
    url = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 250, "return_full_text": False}
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "")
            return str(result)
        else:
            logger.error(f"HF API Error: {response.status_code} - {response.text}")
            return f"ERROR: API returned {response.status_code}"
    except requests.exceptions.Timeout:
        logger.error("HF API Timeout after 30s")
        return "ERROR: API Timeout"
    except Exception as e:
        logger.error(f"HF API unexpected error: {e}")
        return f"ERROR: {str(e)}"

def clean_sql(raw):
    """Strips markdown, preambles, and trailing chars."""
    clean = raw.replace("```sql", "").replace("```", "").strip()
    clean = clean.split('\n')[0] # Take first line if there's fluff
    return clean.rstrip(';')

def detect_tables_used(sql, schema_info):
    """Identifies which tables from schema are used in the SQL."""
    available_tables = schema_info.get("tables", [])
    used = []
    sql_upper = sql.upper()
    for table in available_tables:
        if f" {table.upper()} " in f" {sql_upper} " or f" {table.upper()}." in f" {sql_upper} ":
            used.append(table)
    return list(set(used))

def detect_available_joins(schema_info):
    """Extracts FK relationships for UI hints."""
    return schema_info.get("foreign_keys", [])

def refine_and_package(raw, question, schema_info):
    """Final refinement and packaging of the response."""
    sql = clean_sql(raw)
    
    # Fallback if API failed
    if "ERROR" in raw:
        sql = "-- Model currently unavailable. Please try again later."
    
    tables_used = detect_tables_used(sql, schema_info)
    available_joins = detect_available_joins(schema_info)
    
    return {
        "sql": sql,
        "tables_used": tables_used,
        "available_joins": available_joins
    }

@app.post("/generate")
async def generate(request: GenerateRequest):
    start_time = time.time()
    
    prompt = build_prompt(request.schema_str, request.question)
    raw_output = call_hf_api(prompt)
    
    response = refine_and_package(raw_output, request.question, request.schema_info)
    
    duration = time.time() - start_time
    logger.info(
        f"Request Processed | Q_Len: {len(request.question)} | SQL_Len: {len(response['sql'])} | Duration: {duration:.2f}s"
    )
    
    return response

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_id": HF_MODEL_ID,
        "version": VERSION
    }

@app.get("/models")
async def list_models():
    return {
        "models": [
            {"id": HF_MODEL_ID, "type": "NL-to-SQL", "framework": "PyTorch/HF"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
