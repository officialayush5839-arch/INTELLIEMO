"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Request Schemas ──

class AnalyzeTextRequest(BaseModel):
    """Schema for single text analysis request."""
    text: str = Field(..., min_length=1, max_length=2000, description="Text to analyze")
    include_explanation: bool = Field(default=True, description="Include token explanations")


class BatchAnalyzeRequest(BaseModel):
    """Schema for batch analysis."""
    texts: list[str] = Field(..., min_items=1, max_items=100)
    include_explanation: bool = Field(default=False)


# ── Response Schemas ──

class EmotionProbabilities(BaseModel):
    """Emotion probability scores."""
    emotions: dict[str, float] = Field(default_factory=dict)


class ExplanationToken(BaseModel):
    """Token-level explanation."""
    token: str
    contribution: float
    positive: bool


class Explanation(BaseModel):
    """Model explanation for a prediction."""
    method: str = "token_attribution"
    tokens: list[ExplanationToken] = Field(default_factory=list)
    target_emotion: Optional[str] = None
    baseline_confidence: Optional[float] = None
    note: str = "Explanations are model-attribution signals and should not be interpreted as human psychological reasoning."


class ModelInfo(BaseModel):
    """Model metadata included in response."""
    name: str = ""
    version: str = ""
    architecture: str = ""


class TextFeatures(BaseModel):
    """Linguistic features detected in text."""
    has_negation: bool = False
    has_intensifier: bool = False
    exclamation_count: int = 0
    question_count: int = 0
    keywords: list[str] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    """Full analysis result response."""
    id: str
    text: str
    dominant_emotion: str
    secondary_emotion: Optional[str] = None
    is_mixed_emotion: bool = False
    emotional_shift: Optional[str] = None
    confidence: float
    probabilities: dict[str, float]
    language: str = "en"
    word_count: int = 0
    character_count: int = 0
    processing_time_ms: float = 0.0
    model: ModelInfo = Field(default_factory=ModelInfo)
    explanation: Optional[Explanation] = None
    interpretation: Optional[str] = None
    features: Optional[TextFeatures] = None
    created_at: Optional[datetime] = None
    is_demo: bool = False


class BatchResult(BaseModel):
    """Result of a single item in a batch job."""
    id: int
    text: str
    predicted_emotion: str
    confidence: float
    probabilities: dict[str, float]
    processing_time_ms: float


class BatchJobResult(BaseModel):
    """Full batch analysis result."""
    job_id: str
    total_records: int
    processed: int
    successful: int
    failed: int
    average_confidence: float
    most_common_emotion: str
    results: list[BatchResult]


# ── Analytics Schemas ──

class AnalyticsSummary(BaseModel):
    """Dashboard analytics summary."""
    total_analyses: int
    average_confidence: float
    most_frequent_emotion: str
    dominant_emotion: str
    emotion_distribution: dict[str, int]
    daily_counts: list[dict]


class EmotionTrend(BaseModel):
    """Emotion trend data point."""
    date: str
    count: int
    emotion: Optional[str] = None


# ── Model Schemas ──

class ModelVersionInfo(BaseModel):
    """Model version details."""
    id: str
    name: str
    version: str
    architecture: str
    dataset: str
    classification_type: str
    status: str
    created_at: datetime
    metrics: dict = Field(default_factory=dict)


class EvaluationMetrics(BaseModel):
    """Model evaluation metrics."""
    model_id: str
    model_name: str
    accuracy: Optional[float] = None
    precision_macro: Optional[float] = None
    recall_macro: Optional[float] = None
    f1_macro: Optional[float] = None
    f1_weighted: Optional[float] = None
    per_class: dict[str, dict[str, float]] = Field(default_factory=dict)
    confusion_matrix: list[list[int]] = Field(default_factory=list)
    labels: list[str] = Field(default_factory=list)


# ── History Schemas ──

class AnalysisListItem(BaseModel):
    """List item for history view."""
    id: str
    text: str
    dominant_emotion: str
    confidence: float
    language: str
    word_count: int
    processing_time_ms: float
    created_at: datetime
    is_demo: bool = False


class HistoryResponse(BaseModel):
    """Paginated history response."""
    items: list[AnalysisListItem]
    total: int
    skip: int
    limit: int


# ── Health Schema ──

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    model_loaded: bool
    database: str


# ── Error Schema ──

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: dict


# ── Settings ──

class SettingsUpdate(BaseModel):
    """Settings update request."""
    max_text_length: Optional[int] = None
    save_history: Optional[bool] = None
    confidence_threshold: Optional[float] = None
