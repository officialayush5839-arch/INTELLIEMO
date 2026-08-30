"""Inference pipeline for emotion detection."""

from typing import Optional
from app.ml.model_loader import model_manager
from app.ml.preprocessing import normalize_text, analyze_text_features
from app.ml.explainability import explain_prediction


def run_inference(
    text: str,
    include_explanation: bool = True,
) -> dict:
    """Run the full inference pipeline on text."""
    normalized = normalize_text(text)
    features = analyze_text_features(normalized)
    prediction = model_manager.predict(normalized)

    explanation = None
    if include_explanation and model_manager.loaded:
        explanation = explain_prediction(normalized, prediction.get("dominant_emotion"))

    return {
        "probabilities": prediction.get("probabilities", {}),
        "dominant_emotion": prediction.get("dominant_emotion", "neutral"),
        "confidence": prediction.get("confidence", 0.0),
        "inference_time_ms": prediction.get("inference_time_ms", 0.0),
        "language": features.get("language", "en"),
        "features": features,
        "explanation": explanation,
    }
