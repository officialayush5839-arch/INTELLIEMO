"""Analytics API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/analytics/summary", summary="Get analytics summary")
async def get_analytics_summary(db: Session = Depends(get_db)):
    """Get dashboard analytics summary with KPIs."""
    return analytics_service.get_summary(db)


@router.get("/analytics/emotions", summary="Get emotion distribution")
async def get_emotion_distribution(db: Session = Depends(get_db)):
    """Get emotion distribution data for charts."""
    summary = analytics_service.get_summary(db)
    return {
        "distribution": summary.get("emotion_distribution", {}),
        "total": summary.get("total_analyses", 0),
    }


@router.get("/analytics/confidence", summary="Get confidence distribution")
async def get_confidence_distribution(db: Session = Depends(get_db)):
    """Get confidence score distribution."""
    return analytics_service.get_confidence_distribution(db)


@router.get("/analytics/trends", summary="Get emotion trends")
async def get_emotion_trends(db: Session = Depends(get_db)):
    """Get emotion trends over time."""
    return {"trends": analytics_service.get_emotion_trends(db)}
