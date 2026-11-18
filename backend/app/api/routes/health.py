"""Health check API endpoint."""

from fastapi import APIRouter
from app.core.config import get_settings
from app.ml.model_loader import model_manager

router = APIRouter()
settings = get_settings()


@router.get("/health", summary="Health check")
async def health_check():
    """Check application health status."""
    is_ready = model_manager.loaded or getattr(model_manager, "is_fallback", False)
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "model_loaded": is_ready,
        "transformer_loaded": model_manager.loaded,
        "model_ready": is_ready,
        "model_status": (
            "ready"
            if model_manager.loaded
            else ("fallback" if getattr(model_manager, "is_fallback", False) else ("warming_up" if getattr(model_manager, "is_loading", False) else "initializing"))
        ),
        "database": "connected",
    }
