from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..schema import schema_parser

router = APIRouter()

# In-memory storage for simplicity
schemas_db = {}

class SchemaPasteRequest(BaseModel):
    name: str
    text: str

@router.post("/upload")
async def upload_schema(name: str, file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")
    parsed = schema_parser.parse_schema_text(text)
    schema_dict = schema_parser.build_schema_dictionary(parsed)
    schemas_db[name] = schema_dict
    return {"name": name, "tables": schema_parser.extract_tables(parsed)}

@router.post("/paste")
async def paste_schema(request: SchemaPasteRequest):
    parsed = schema_parser.parse_schema_text(request.text)
    schema_dict = schema_parser.build_schema_dictionary(parsed)
    schemas_db[request.name] = schema_dict
    return {"name": request.name, "tables": schema_parser.extract_tables(parsed)}

@router.get("/tables/{name}")
async def get_tables(name: str):
    if name not in schemas_db:
        raise HTTPException(status_code=404, detail="Schema not found")
    return {"tables": list(schemas_db[name]["tables"].keys())}

@router.get("/relationships/{name}")
async def get_relationships(name: str):
    if name not in schemas_db:
        raise HTTPException(status_code=404, detail="Schema not found")
    return {"relationships": schemas_db[name]["foreign_keys"]}

@router.get("/list")
async def list_schemas():
    return {"schemas": list(schemas_db.keys())}

@router.get("/get/{name}")
async def get_schema(name: str):
    if name not in schemas_db:
        raise HTTPException(status_code=404, detail="Schema not found")
    return schemas_db[name]
