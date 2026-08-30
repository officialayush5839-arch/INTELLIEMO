"""Repository layer for database operations."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import desc, asc, func
from sqlalchemy.orm import Session

from app.db.models import (
    Analysis, BatchJob, ModelVersion, EvaluationMetric, Setting
)


class AnalysisRepository:
    """Repository for analysis CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Analysis:
        analysis = Analysis(**kwargs)
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def get_by_id(self, analysis_id: str) -> Optional[Analysis]:
        return self.db.query(Analysis).filter(Analysis.id == analysis_id).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        emotion: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "latest",
    ) -> list[Analysis]:
        query = self.db.query(Analysis)

        if emotion:
            query = query.filter(Analysis.dominant_emotion == emotion)
        if search:
            query = query.filter(Analysis.text.ilike(f"%{search}%"))

        sort_map = {
            "latest": desc(Analysis.created_at),
            "oldest": asc(Analysis.created_at),
            "highest_confidence": desc(Analysis.confidence),
            "lowest_confidence": asc(Analysis.confidence),
        }
        query = query.order_by(sort_map.get(sort_by, desc(Analysis.created_at)))
        return query.offset(skip).limit(limit).all()

    def count(self) -> int:
        return self.db.query(Analysis).count()

    def count_by_emotion(self) -> dict[str, int]:
        results = (
            self.db.query(Analysis.dominant_emotion, func.count(Analysis.id))
            .group_by(Analysis.dominant_emotion)
            .all()
        )
        return {emotion: count for emotion, count in results}

    def average_confidence(self) -> float:
        result = self.db.query(func.avg(Analysis.confidence)).scalar()
        return result or 0.0

    def most_frequent_emotion(self) -> Optional[str]:
        result = (
            self.db.query(Analysis.dominant_emotion, func.count(Analysis.id))
            .group_by(Analysis.dominant_emotion)
            .order_by(desc(func.count(Analysis.id)))
            .first()
        )
        return result[0] if result else None

    def delete(self, analysis_id: str) -> bool:
        analysis = self.get_by_id(analysis_id)
        if analysis:
            self.db.delete(analysis)
            self.db.commit()
            return True
        return False

    def delete_all_demos(self) -> int:
        count = self.db.query(Analysis).filter(Analysis.is_demo == True).count()
        self.db.query(Analysis).filter(Analysis.is_demo == True).delete()
        self.db.commit()
        return count

    def get_daily_counts(self, days: int = 30) -> list[dict]:
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        results = (
            self.db.query(
                func.date(Analysis.created_at).label("date"),
                func.count(Analysis.id).label("count")
            )
            .filter(Analysis.created_at >= cutoff)
            .group_by(func.date(Analysis.created_at))
            .order_by(asc(func.date(Analysis.created_at)))
            .all()
        )
        return [{"date": str(r.date), "count": r.count} for r in results]

    def get_emotion_distribution(self) -> dict[str, int]:
        return self.count_by_emotion()


class BatchJobRepository:
    """Repository for batch job operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> BatchJob:
        job = BatchJob(**kwargs)
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_by_id(self, job_id: str) -> Optional[BatchJob]:
        return self.db.query(BatchJob).filter(BatchJob.id == job_id).first()

    def get_all(self, skip: int = 0, limit: int = 20) -> list[BatchJob]:
        return (
            self.db.query(BatchJob)
            .order_by(desc(BatchJob.created_at))
            .offset(skip).limit(limit).all()
        )


class ModelVersionRepository:
    """Repository for model version operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> ModelVersion:
        mv = ModelVersion(**kwargs)
        self.db.add(mv)
        self.db.commit()
        self.db.refresh(mv)
        return mv

    def get_by_id(self, mv_id: str) -> Optional[ModelVersion]:
        return self.db.query(ModelVersion).filter(ModelVersion.id == mv_id).first()

    def get_active(self) -> Optional[ModelVersion]:
        return (
            self.db.query(ModelVersion)
            .filter(ModelVersion.status == "active")
            .order_by(desc(ModelVersion.created_at))
            .first()
        )

    def get_all(self) -> list[ModelVersion]:
        return self.db.query(ModelVersion).order_by(desc(ModelVersion.created_at)).all()


class SettingRepository:
    """Repository for application settings."""

    def __init__(self, db: Session):
        self.db = db

    def get(self, key: str) -> Optional[str]:
        setting = self.db.query(Setting).filter(Setting.key == key).first()
        return setting.value if setting else None

    def set(self, key: str, value: str) -> None:
        setting = self.db.query(Setting).filter(Setting.key == key).first()
        if setting:
            setting.value = value
        else:
            setting = Setting(key=key, value=value)
            self.db.add(setting)
        self.db.commit()

    def get_all(self) -> dict[str, str]:
        settings = self.db.query(Setting).all()
        return {s.key: s.value for s in settings}
