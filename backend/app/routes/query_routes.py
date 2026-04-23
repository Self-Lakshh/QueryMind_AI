import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..config.settings import settings
from ..query import query_validator, query_executor
from .schema_routes import schemas_db

router = APIRouter()

class GenerateRequest(BaseModel):
    question: str
    schema_name: str

class ValidateRequest(BaseModel):
    sql: str
    schema_name: str

class ExecuteRequest(BaseModel):
    sql: str
    schema_name: str

@router.post("/generate")
async def generate_sql(request: GenerateRequest):
    if request.schema_name not in schemas_db:
        raise HTTPException(status_code=404, detail="Schema not found")
    
    schema_info = schemas_db[request.schema_name]
    from ..schema.schema_parser import schema_to_text
    schema_str = schema_to_text(schema_info)
    
    payload = {
        "question": request.question,
        "schema_str": schema_str,
        "schema_info": {"tables": list(schema_info["tables"].keys()), "foreign_keys": schema_info["foreign_keys"]}
    }
    
    try:
        response = requests.post(settings.AI_SERVER_URL, json=payload, timeout=35)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": "AI service unavailable", "status_code": response.status_code}
    except Exception as e:
        return {"error": "AI service unavailable"}

@router.post("/validate")
async def validate_sql(request: ValidateRequest):
    if request.schema_name not in schemas_db:
        raise HTTPException(status_code=404, detail="Schema not found")
    
    schema_dict = schemas_db[request.schema_name]
    return query_validator.full_validate(request.sql, schema_dict)

@router.post("/execute")
async def execute_query(request: ExecuteRequest):
    if request.schema_name not in schemas_db:
        raise HTTPException(status_code=404, detail="Schema not found")
    
    schema_dict = schemas_db[request.schema_name]
    
    # 1. Validate
    validation = query_validator.full_validate(request.sql, schema_dict)
    if not validation["valid"]:
        return {"error": validation["error"]}
    
    # 2. Execute
    result = query_executor.executor.run_select_query(request.sql)
    return result

@router.post("/explain")
async def explain_sql(request: ValidateRequest):
    # Mock explanation
    return {"explanation": f"This query retrieves data from tables mentioned in the SQL based on the provided conditions."}

@router.post("/cost")
async def get_cost(request: ValidateRequest):
    cost = query_executor.executor.estimate_query_cost(request.sql)
    return {"cost": cost}
