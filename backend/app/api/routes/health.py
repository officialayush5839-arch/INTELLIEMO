"""Health check API endpoint."""

from fastapi import APIRouter
from app.core.config import get_settings
from app.ml.model_loader import model_manager

router = APIRouter()
settings = get_settings()


@router.get("/health", summary="Health check")
async def health_check():
    """Check application health status."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "model_loaded": model_manager.loaded,
        "database": "connected",
    }
