"""Model information and evaluation API endpoints."""

from fastapi import APIRouter
from app.services.model_service import model_service
from app.ml.model_loader import model_manager

router = APIRouter()


@router.get("/model", summary="Get model information")
async def get_model_info():
    """Get detailed model information and metadata."""
    return model_service.get_model_info()


@router.get("/model/metrics", summary="Get model evaluation metrics")
async def get_model_metrics():
    """Get model evaluation metrics (accuracy, F1, etc.)."""
    return model_service.get_evaluation_metrics()


@router.get("/model/evaluation", summary="Get detailed evaluation")
async def get_model_evaluation():
    """Get comprehensive model evaluation including per-class metrics."""
    return model_service.get_evaluation_metrics()


@router.get("/model/confusion-matrix", summary="Get confusion matrix")
async def get_confusion_matrix():
    """Get confusion matrix data for visualization."""
    return model_service.get_confusion_matrix()


@router.get("/model/comparison", summary="Get model comparison")
async def get_model_comparison():
    """Get comparison data for different model architectures."""
    return {"models": model_service.get_model_comparison()}


@router.get("/model/status", summary="Get model status")
async def get_model_status():
    """Get current model loading status."""
    return model_manager.get_status()
