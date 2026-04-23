from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(
    title="QueryMind AI Inference Server",
    description="Inference server for NL-to-SQL generation",
    version="0.1.0",
)

class QueryRequest(BaseModel):
    natural_language_query: str
    db_id: str
    schema_str: str

class QueryResponse(BaseModel):
    generated_sql: str
    confidence: float

@app.post("/generate", response_model=QueryResponse)
async def generate_sql(request: QueryRequest):
    """
    Placeholder for NL-to-SQL generation logic.
    Eventually this will call the Gemini model.
    """
    # Dummy logic for now
    nl = request.natural_language_query.lower()
    sql = "SELECT * FROM placeholder"
    
    if "all" in nl and "users" in nl:
        sql = "SELECT user_id, username, email FROM users"
    elif "count" in nl:
        sql = "SELECT count(*) FROM placeholder"
    
    # Simple safety check as per rules (No SELECT *)
    if "*" in sql:
        sql = sql.replace("*", "id, name") # Dummy specific columns
        
    return {
        "generated_sql": sql,
        "confidence": 0.85
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
