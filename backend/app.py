"""
SupportMind FastAPI Backend Entrypoint
Production-grade API server with CORS, rate limiting, and auto-docs
"""
import os
import sys

# Add parent directory to path so relative imports work when run from root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment from backend/.env
from dotenv import load_dotenv
if not os.getenv("VERCEL"):
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from backend.config import settings, validate_production_settings
from backend.database.database import engine, Base
from backend.middleware.security import install_security_headers
from backend.routes import auth, support, tickets, memory, analytics

validate_production_settings()

# ─── Create all DB tables ─────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

if settings.ENVIRONMENT != "production" or os.getenv("VERCEL"):
    from backend.seed import seed
    seed()

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="SupportMind API",
    description="""
## SupportMind Production Backend

AI-powered customer support with **Hindsight Memory™** and **CascadeFlow™** routing.

### Features
- 🔐 Google OAuth 2.0 Authentication
- 🧠 Persistent customer memory (Hindsight™)
- ⚡ Smart model routing (CascadeFlow™)
- 🤖 Provider-agnostic AI responses
- 📊 Real-time analytics dashboard
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

install_security_headers(app)


@app.middleware("http")
async def strip_vercel_api_prefix(request, call_next):
    if request.scope.get("path", "").startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:]
    return await call_next(request)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.APP_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routes ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(support.router)
app.include_router(tickets.router)
app.include_router(memory.router)
app.include_router(analytics.router)

# ─── Root Health Check ────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "service": "SupportMind API",
        "version": "1.0.0",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
