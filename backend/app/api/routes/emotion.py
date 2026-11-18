"""Emotion analysis API endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories import AnalysisRepository
from app.schemas.schemas import (
    AnalyzeTextRequest,
    AnalysisResult,
    EmotionProbabilities,
    ErrorResponse,
)
from app.services.emotion_service import emotion_service
from app.ml.model_loader import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="Analyze text for emotions",
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        503: {"model": ErrorResponse, "description": "Model not available"},
    },
)
def analyze_text(
    request: AnalyzeTextRequest,
    db: Session = Depends(get_db),
):
    """
    Analyze a piece of text and return emotion predictions with confidence scores.

    - **text**: The text to analyze (1-2000 characters)
    - **include_explanation**: Whether to include token-level explanations
    """
    # Validate
    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "EMPTY_TEXT", "message": "Please provide text for analysis."}},
        )

    if len(request.text) > 2000:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "TEXT_TOO_LONG", "message": "Text must be 2000 characters or fewer."}},
        )

    # Ensure model is ready (waits for warmup if in progress, or engages resilient engine)
    if not model_manager.loaded:
        model_manager.ensure_ready(timeout=25.0)

    if not (model_manager.loaded or getattr(model_manager, "is_fallback", False)):
        raise HTTPException(
            status_code=503,
            detail={"error": {"code": "MODEL_UNAVAILABLE", "message": "Emotion model is not loaded."}},
        )

    try:
        # Run analysis
        result = emotion_service.analyze(
            text=request.text,
            include_explanation=request.include_explanation,
        )

        # Save to database
        repo = AnalysisRepository(db)
        analysis = repo.create(
            text=request.text,
            language=result.get("language", "en"),
            dominant_emotion=result["dominant_emotion"],
            confidence=result["confidence"],
            probabilities_json=result["probabilities"],
            explanation_json=result.get("explanation") or {},
            word_count=result.get("word_count", 0),
            character_count=result.get("character_count", 0),
            processing_time_ms=result.get("processing_time_ms", 0),
            is_demo=False,
        )

        result["id"] = analysis.id
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": str(e), "message": f"Validation error: {str(e)}"}},
        )
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "ANALYSIS_ERROR", "message": "An error occurred during analysis."}},
        )


@router.get("/emotions", summary="Get supported emotions")
def get_emotions():
    """Get list of supported emotion categories."""
    emotions = emotion_service.get_supported_emotions()
    return {"emotions": emotions}
