# QueryMind AI Startup Guide

To run the complete QueryMind AI suite locally, follow these steps in order. Open a separate terminal for each service.

## 1. Start AI Inference Server
Handles the LLM logic and SQL generation.
```bash
cd ai/inference
# Ensure dependencies are installed
pip install -r requirements.txt
# Run the server
python inference_server.py
```
*Port: 8001*

## 2. Start Backend Server
Handles schema parsing, security validation, and query execution.
```bash
cd backend
# Ensure dependencies are installed
pip install -r requirements.txt
# Run the server (assumes uvicorn is installed)
uvicorn app.main:app --reload --port 8000
```
*Port: 8000*

## 3. Start Frontend Dev Server
The Anti-Gravity React dashboard.
```bash
cd frontend
# Ensure dependencies are installed
npm install
# Run the dev server
npm run dev
```
*Port: 5173*

---

### Integration Verification
- **Frontend** should be accessible at `http://localhost:5173`.
- **Backend Health**: `http://localhost:8000/` should return `{"status": "online"}`.
- **AI Health**: `http://localhost:8001/health` should return `{"status": "ok"}`.
