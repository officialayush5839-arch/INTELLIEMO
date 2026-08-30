"""Model service for model management and evaluation metrics."""

import os
import json
import logging
from pathlib import Path
from typing import Optional

from app.ml.model_loader import model_manager
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ModelService:
    """Service for model management and evaluation."""

    def get_model_info(self) -> dict:
        """Get comprehensive model information."""
        meta = model_manager.get_metadata()
        name = meta.get("name")
        if not name or name == "Not loaded":
            name = "Ayush Vishwakarma's model"
        return {
            "id": "model-1",
            "name": name,
            "version": meta.get("version", "1.0.0"),
            "architecture": meta.get("architecture", "DistilBERT"),
            "dataset": meta.get("dataset", "emotion"),
            "classification_type": meta.get("classification_type", "multi-class"),
            "num_classes": meta.get("num_classes", 0),
            "labels": meta.get("labels", []),
            "max_length": meta.get("max_length", 128),
            "device": meta.get("device", "cpu"),
            "loaded": meta.get("loaded", False),
            "load_time_seconds": meta.get("load_time_seconds", 0),
            "parameters": meta.get("parameters", 0),
            "tokenizer": "AutoTokenizer (transformers)",
            "training_date": "N/A",
            "model_version_id": "emotion-distilbert-v1",
            "status": "active" if meta.get("loaded") else "not_loaded",
        }

    def get_evaluation_metrics(self) -> dict:
        """Get model evaluation metrics."""
        # Try to load saved metrics from configured path or fallback paths
        candidate_dirs = [
            Path(settings.MODEL_PATH),
            Path(__file__).resolve().parent.parent.parent.parent / "models" / "emotion_model",
            Path(__file__).resolve().parent.parent.parent / "models" / "emotion_model",
        ]
        for m_dir in candidate_dirs:
            metrics_path = m_dir / "metrics.json"
            if metrics_path.exists():
                try:
                    with open(metrics_path, encoding="utf-8") as f:
                        return {"available": True, **json.load(f)}
                except Exception:
                    pass

        if not model_manager.loaded:
            return {
                "available": False,
                "message": "Model not trained yet. Evaluation metrics unavailable.",
            }

        # Return model-reported metrics from config if available
        return {
            "available": True,
            "accuracy": None,
            "precision_macro": None,
            "recall_macro": None,
            "f1_macro": None,
            "f1_weighted": None,
            "per_class": {},
            "confusion_matrix": [],
            "labels": model_manager.labels,
            "message": "Train the model to populate evaluation metrics: python -m ml.training.train",
        }

    def get_confusion_matrix(self) -> dict:
        """Get confusion matrix data."""
        metrics = self.get_evaluation_metrics()
        return {
            "available": metrics.get("available", False),
            "matrix": metrics.get("confusion_matrix", []),
            "labels": metrics.get("labels", []),
        }

    def get_model_comparison(self) -> list[dict]:
        """Get comparison data for different models."""
        comparisons = [
            {
                "name": "TF-IDF + Logistic Regression",
                "accuracy": None,
                "f1_macro": None,
                "f1_weighted": None,
                "inference_latency_ms": None,
                "model_size": "Small",
                "training_time": "Fast",
                "status": "not_trained",
            },
            {
                "name": "TF-IDF + SVM",
                "accuracy": None,
                "f1_macro": None,
                "f1_weighted": None,
                "inference_latency_ms": None,
                "model_size": "Small",
                "training_time": "Fast",
                "status": "not_trained",
            },
            {
                "name": "DistilBERT",
                "accuracy": None,
                "f1_macro": None,
                "f1_weighted": None,
                "inference_latency_ms": None,
                "model_size": "~268M params",
                "training_time": "Medium",
                "status": "active" if model_manager.loaded else "not_trained",
                "is_current": model_manager.loaded,
            },
        ]

        # Candidate search locations for metrics
        candidate_dirs = [
            Path(settings.MODEL_PATH),
            Path(__file__).resolve().parent.parent.parent.parent / "models" / "emotion_model",
            Path(__file__).resolve().parent.parent.parent / "models" / "emotion_model",
        ]

        # Try to load metrics for each
        for comp in comparisons:
            file_names = [f"{comp['name'].lower().replace(' ', '_')}_metrics.json"]
            if "distilbert" in comp["name"].lower():
                file_names.append("metrics.json")

            for m_dir in candidate_dirs:
                loaded = False
                for fname in file_names:
                    metrics_path = m_dir / fname
                    if metrics_path.exists():
                        try:
                            with open(metrics_path, encoding="utf-8") as f:
                                data = json.load(f)
                                comp.update(data)
                                comp["status"] = "active" if comp.get("is_current") else "trained"
                                loaded = True
                                break
                        except Exception:
                            pass
                if loaded:
                    break

        return comparisons


model_service = ModelService()
