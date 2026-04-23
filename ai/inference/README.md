# QueryMind AI Inference Server

Standalone FastAPI server for Natural Language to SQL generation using fine-tuned HuggingFace models.

## 🚀 Getting Started

1. **Setup Environment**:
   Copy `.env.example` to `.env` and fill in your HuggingFace token and model ID.
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r ai/inference/requirements.txt
   ```

3. **Run the Server**:
   ```bash
   python ai/inference/inference_server.py
   ```
   The server will start on `http://localhost:8001`.

## 📡 API Endpoints

### POST `/generate`
Generates SQL from natural language.
- **Request Body**:
  ```json
  {
    "question": "Show all users from London",
    "schema_str": "Database: users | Tables: users(id, name, city)",
    "schema_info": {
       "tables": ["users"],
       "foreign_keys": []
    }
  }
  ```
- **Response**:
  ```json
  {
    "sql": "SELECT id, name, city FROM users WHERE city = 'London'",
    "tables_used": ["users"],
    "available_joins": []
  }
  ```

### GET `/health`
Check server and model status.

### GET `/models`
List supported models.

## 🧪 Testing with cURL
```bash
curl -X POST "http://localhost:8001/generate" \
     -H "Content-Type: application/json" \
     -d '{"question": "How many users?", "schema_str": "Tables: users(id)", "schema_info": {"tables":["users"]}}'
```
