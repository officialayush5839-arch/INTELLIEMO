"""INTELLIEMO - Main FastAPI Application.

An Intelligent Emotion Detection System from Text
Using Natural Language Processing and Deep Learning.
"""

import logging
import os
import sys
import time
import threading
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.database import init_db
from app.ml.model_loader import model_manager

# Ensure project root is in Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

settings = get_settings()
logger = logging.getLogger(__name__)


def _warmup_model():
    """Warm up the ML model in background so server binds immediately and passes health checks."""
    try:
        time.sleep(1)
        logger.info("Background loading emotion detection model...")
        model_path = settings.MODEL_PATH
        if os.path.exists(model_path):
            success = model_manager.load_from_local(model_path)
            if success:
                logger.info("Loaded model from local path: %s", model_path)
        if not model_manager.loaded:
            success = model_manager.load_from_pretrained(
                "bhadresh-savani/distilbert-base-uncased-emotion"
            )
            if success:
                logger.info("Loaded pretrained emotion model from HuggingFace")
            else:
                logger.warning("Could not load any model. Fallback on-demand load will be used.")
    except Exception as e:
        logger.error("Background model loading encountered error: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # ── Startup ──
    setup_logging(settings.LOG_LEVEL)
    logger.info("Starting INTELLIEMO backend v%s", settings.APP_VERSION)

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Start background model loading
    warmup_thread = threading.Thread(target=_warmup_model, daemon=True)
    warmup_thread.start()

    yield

    # ── Shutdown ──
    logger.info("Shutting down INTELLIEMO backend")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="INTELLIEMO API",
        description=(
            "An Intelligent Emotion Detection System from Text "
            "Using Natural Language Processing and Deep Learning."
        ),
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Request size limit middleware ──
    @app.middleware("http")
    async def limit_request_size(request: Request, call_next):
        if request.headers.get("content-length"):
            if int(request.headers["content-length"]) > 10 * 1024 * 1024:
                return JSONResponse(
                    status_code=413,
                    content={"error": {"code": "PAYLOAD_TOO_LARGE", "message": "Request too large."}},
                )
        response = await call_next(request)
        return response

    # ── Global exception handler ──
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception: %s", str(exc), exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "INTERNAL_ERROR", "message": "An internal error occurred."}},
        )

    # ── Register API routes ──
    from app.api.routes import health, emotion, batch, history, analytics, model

    api_prefix = "/api/v1"
    app.include_router(health.router, prefix=api_prefix, tags=["Health"])
    app.include_router(emotion.router, prefix=api_prefix, tags=["Emotion Analysis"])
    app.include_router(batch.router, prefix=api_prefix, tags=["Batch Analysis"])
    app.include_router(history.router, prefix=api_prefix, tags=["History"])
    app.include_router(analytics.router, prefix=api_prefix, tags=["Analytics"])
    app.include_router(model.router, prefix=api_prefix, tags=["Model"])

    # ── Static / SPA Integration (Unified Deployments) ──
    dist_dir = PROJECT_ROOT / "frontend" / "dist"
    if dist_dir.exists() and (dist_dir / "index.html").exists():
        from fastapi.staticfiles import StaticFiles
        from fastapi.responses import FileResponse

        assets_dir = dist_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            if (
                full_path.startswith("api/")
                or full_path.startswith("docs")
                or full_path.startswith("redoc")
                or full_path.startswith("openapi.json")
            ):
                return JSONResponse(status_code=404, content={"detail": "Not Found"})
            file_path = dist_dir / full_path
            if file_path.is_file():
                return FileResponse(file_path)
            return FileResponse(dist_dir / "index.html")
    else:
        # Fallback root API endpoint when frontend is deployed separately
        @app.get("/", tags=["Root"])
        async def root():
            return {
                "name": "INTELLIEMO",
                "version": settings.APP_VERSION,
                "description": "An Intelligent Emotion Detection System from Text Using NLP and Deep Learning",
                "docs": "/docs",
                "api": "/api/v1",
            }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
    )
