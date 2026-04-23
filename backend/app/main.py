from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routes import schema_routes, query_routes

def create_app() -> FastAPI:
    app = FastAPI(
        title="QueryMind AI Backend",
        description="REST API for QueryMind - Natural Language to SQL Assistant",
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None
    )

    init_middlewares(app)
    init_routes(app)
    
    return app

def init_middlewares(app: FastAPI):
    origins = settings.ALLOWED_ORIGINS.split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def init_routes(app: FastAPI):
    app.include_router(schema_routes.router, prefix="/api/v1/schema", tags=["schema"])
    app.include_router(query_routes.router, prefix="/api/v1/query", tags=["query"])

    @app.get("/")
    async def root():
        return {"status": "online", "message": "QueryMind AI Backend Ready"}

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
