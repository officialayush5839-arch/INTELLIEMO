"""History API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories import AnalysisRepository
from app.schemas.schemas import HistoryResponse, AnalysisListItem

router = APIRouter()


@router.get("/analyses", response_model=HistoryResponse, summary="Get analysis history")
async def get_analyses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    emotion: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("latest", pattern="^(latest|oldest|highest_confidence|lowest_confidence)$"),
    db: Session = Depends(get_db),
):
    """Get paginated analysis history with optional filtering and sorting."""
    repo = AnalysisRepository(db)
    analyses = repo.get_all(skip=skip, limit=limit, emotion=emotion, search=search, sort_by=sort_by)
    total = repo.count()

    items = [
        AnalysisListItem(
            id=a.id,
            text=a.text[:100] + ("..." if len(a.text) > 100 else ""),
            dominant_emotion=a.dominant_emotion,
            confidence=a.confidence,
            language=a.language,
            word_count=a.word_count,
            processing_time_ms=a.processing_time_ms,
            created_at=a.created_at,
            is_demo=a.is_demo,
        )
        for a in analyses
    ]

    return HistoryResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/analyses/{analysis_id}", summary="Get analysis details")
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Get full details of a specific analysis."""
    repo = AnalysisRepository(db)
    analysis = repo.get_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Analysis not found."}})

    return {
        "id": analysis.id,
        "text": analysis.text,
        "dominant_emotion": analysis.dominant_emotion,
        "confidence": analysis.confidence,
        "probabilities": analysis.probabilities_json,
        "explanation": analysis.explanation_json,
        "language": analysis.language,
        "word_count": analysis.word_count,
        "character_count": analysis.character_count,
        "processing_time_ms": analysis.processing_time_ms,
        "created_at": analysis.created_at,
        "is_demo": analysis.is_demo,
    }


@router.delete("/analyses/{analysis_id}", summary="Delete an analysis")
async def delete_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Delete a specific analysis from history."""
    repo = AnalysisRepository(db)
    deleted = repo.delete(analysis_id)
    if not deleted:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Analysis not found."}})
    return {"message": "Analysis deleted."}


@router.delete("/analyses", summary="Clear all history")
async def clear_history(db: Session = Depends(get_db)):
    """Delete all analyses from history."""
    repo = AnalysisRepository(db)
    # Get all and delete
    analyses = repo.get_all(limit=10000)
    for a in analyses:
        repo.delete(a.id)
    return {"message": "History cleared.", "deleted": len(analyses)}
