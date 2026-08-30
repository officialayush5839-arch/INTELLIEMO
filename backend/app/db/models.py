"""SQLAlchemy ORM models for the database."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, DateTime, Boolean, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Analysis(Base):
    """Stores individual text analysis results."""
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    text = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    dominant_emotion = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities_json = Column(JSON, nullable=False, default=dict)
    explanation_json = Column(JSON, default=dict)
    word_count = Column(Integer, default=0)
    character_count = Column(Integer, default=0)
    processing_time_ms = Column(Float, default=0.0)
    model_version_id = Column(String(36), ForeignKey("model_versions.id"), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    model_version = relationship("ModelVersion", back_populates="analyses")


class BatchJob(Base):
    """Stores batch analysis job metadata."""
    __tablename__ = "batch_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    total_records = Column(Integer, default=0)
    processed = Column(Integer, default=0)
    successful = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    average_confidence = Column(Float, default=0.0)
    most_common_emotion = Column(String(50), default="")
    results_json = Column(JSON, default=list)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ModelVersion(Base):
    """Tracks model versions and their metadata."""
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    architecture = Column(String(100), default="")
    dataset = Column(String(100), default="")
    classification_type = Column(String(20), default="multi-class")
    path = Column(String(500), default="")
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    metrics_json = Column(JSON, default=dict)

    analyses = relationship("Analysis", back_populates="model_version")
    evaluation_metrics = relationship("EvaluationMetric", back_populates="model_version")


class EvaluationMetric(Base):
    """Stores individual evaluation metrics for model versions."""
    __tablename__ = "evaluation_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_version_id = Column(String(36), ForeignKey("model_versions.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    model_version = relationship("ModelVersion", back_populates="evaluation_metrics")


class Setting(Base):
    """Application settings key-value store."""
    __tablename__ = "settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, default="")
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
