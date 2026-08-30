"""Analytics service for computing dashboard statistics."""

from sqlalchemy.orm import Session
from app.db.repositories import AnalysisRepository


class AnalyticsService:
    """Service for computing analytics from stored analyses."""

    def get_summary(self, db: Session) -> dict:
        """Get complete analytics summary."""
        repo = AnalysisRepository(db)

        total = repo.count()
        avg_confidence = repo.average_confidence()
        most_frequent = repo.most_frequent_emotion() or "N/A"
        distribution = repo.get_emotion_distribution()
        daily_counts = repo.get_daily_counts()

        # Get dominant emotion from distribution
        dominant = most_frequent

        return {
            "total_analyses": total,
            "average_confidence": round(avg_confidence, 4) if avg_confidence else 0.0,
            "most_frequent_emotion": most_frequent,
            "dominant_emotion": dominant,
            "emotion_distribution": distribution,
            "daily_counts": daily_counts,
        }

    def get_emotion_trends(self, db: Session, days: int = 30) -> list[dict]:
        """Get emotion trends over time."""
        repo = AnalysisRepository(db)
        return repo.get_daily_counts(days)

    def get_confidence_distribution(self, db: Session) -> dict:
        """Get confidence score distribution."""
        repo = AnalysisRepository(db)
        analyses = repo.get_all(limit=1000)

        brackets = {"0-20": 0, "20-40": 0, "40-60": 0, "60-80": 0, "80-100": 0}
        for a in analyses:
            pct = a.confidence * 100
            if pct < 20:
                brackets["0-20"] += 1
            elif pct < 40:
                brackets["20-40"] += 1
            elif pct < 60:
                brackets["40-60"] += 1
            elif pct < 80:
                brackets["60-80"] += 1
            else:
                brackets["80-100"] += 1

        return brackets

    def get_batch_stats(self, db: Session) -> dict:
        """Get batch processing statistics."""
        from app.db.models import BatchJob
        jobs = db.query(BatchJob).all()
        return {
            "total_jobs": len(jobs),
            "total_processed": sum(j.processed for j in jobs),
            "total_successful": sum(j.successful for j in jobs),
            "total_failed": sum(j.failed for j in jobs),
        }


analytics_service = AnalyticsService()
