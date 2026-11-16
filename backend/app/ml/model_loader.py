"""Model loading and management for inference."""

import os
import gc
import time
import json
import logging
from typing import Optional
from pathlib import Path

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from app.ml.emotion_labels import EMOTION_LABELS_6, get_all_labels

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Manages transformer model loading and inference.
    Singleton pattern: loads model once at startup.
    """

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.labels: list[str] = []
        self.device: str = "cpu"
        self.model_name: str = "Ayush Vishwakarma's model"
        self.model_path: Optional[str] = None
        self.loaded: bool = False
        self.load_time: float = 0.0
        self.model_version: str = "1.0.0"
        self.dataset_name: str = ""
        self.classification_type: str = "multi-class"
        self.max_length: int = 128
        self.label2id: dict[str, int] = {}
        self.id2label: dict[int, str] = {}

    def _detect_device(self) -> str:
        """Detect the best available device."""
        if torch.cuda.is_available():
            return "cuda"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    def load_from_pretrained(
        self,
        model_name: str = "bhadresh-savani/distilbert-base-uncased-emotion",
        labels: Optional[list[str]] = None,
    ) -> bool:
        """
        Load a pretrained emotion model from Hugging Face Hub.
        Falls back gracefully if model is unavailable.
        """
        try:
            start = time.time()
            self.device = self._detect_device()
            self.model_name = "Ayush Vishwakarma's model"

            logger.info(f"Loading model: {model_name} on {self.device}")

            torch.set_grad_enabled(False)
            try:
                torch.set_num_threads(1)
            except Exception:
                pass
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name, low_cpu_mem_usage=True)
            self.model.to(self.device)
            self.model.eval()

            # Use provided labels or extract from model config
            if labels:
                self.labels = labels
            elif hasattr(self.model.config, "id2label"):
                self.labels = [
                    self.model.config.id2label[i]
                    for i in range(len(self.model.config.id2label))
                ]
            else:
                self.labels = EMOTION_LABELS_6

            self.label2id = {label: i for i, label in enumerate(self.labels)}
            self.id2label = {i: label for i, label in enumerate(self.labels)}
            self.classification_type = "multi-class" if len(self.labels) <= 10 else "multi-label"
            self.loaded = True
            self.load_time = time.time() - start

            logger.info(
                f"Model loaded in {self.load_time:.2f}s. "
                f"Labels: {len(self.labels)}, Device: {self.device}"
            )
            gc.collect()
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.loaded = False
            return False

    def load_from_local(self, path: str) -> bool:
        """Load model from a local directory."""
        has_weights = os.path.exists(os.path.join(path, 'model.safetensors')) or os.path.exists(os.path.join(path, 'pytorch_model.bin'))
        if not os.path.exists(path) or not os.path.exists(os.path.join(path, 'config.json')) or not has_weights:
            logger.info(f"Local model weights (config.json) not found in: {path}")
            return False

        try:
            start = time.time()
            self.device = self._detect_device()
            self.model_path = path
            self.model_name = "Ayush Vishwakarma's model"

            self.tokenizer = AutoTokenizer.from_pretrained(path)
            self.model = AutoModelForSequenceClassification.from_pretrained(path)
            self.model.to(self.device)
            self.model.eval()

            if hasattr(self.model.config, "id2label"):
                self.labels = [
                    self.model.config.id2label[i]
                    for i in range(len(self.model.config.id2label))
                ]
            else:
                self.labels = EMOTION_LABELS_6

            self.label2id = {label: i for i, label in enumerate(self.labels)}
            self.id2label = {i: label for i, label in enumerate(self.labels)}
            self.loaded = True
            self.load_time = time.time() - start

            logger.info(f"Local model loaded from {path} in {self.load_time:.2f}s")
            return True

        except Exception as e:
            logger.error(f"Failed to load local model: {e}")
            return False

    def predict(self, text: str) -> dict:
        """
        Run inference on a single text.
        Returns dict with 'probabilities', 'dominant_emotion', 'confidence'.
        """
        if not self.loaded:
            return {
                "probabilities": {},
                "dominant_emotion": "neutral",
                "confidence": 0.0,
                "inference_time_ms": 0.0,
            }

        try:
            start = time.time()

            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=self.max_length,
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)

            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=-1)[0]

            probs_dict = {
                self.labels[i]: round(probabilities[i].item(), 4)
                for i in range(len(self.labels))
            }

            # Get dominant emotion
            max_prob = max(probs_dict.values())
            dominant_emotion = max(probs_dict, key=probs_dict.get)

            inference_time = (time.time() - start) * 1000

            return {
                "probabilities": probs_dict,
                "dominant_emotion": dominant_emotion,
                "confidence": round(max_prob, 4),
                "inference_time_ms": round(inference_time, 2),
            }

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "probabilities": {},
                "dominant_emotion": "neutral",
                "confidence": 0.0,
                "inference_time_ms": 0.0,
            }

    def predict_batch(self, texts: list[str]) -> list[dict]:
        """Run inference on a batch of texts."""
        return [self.predict(text) for text in texts]

    def get_metadata(self) -> dict:
        """Get model metadata."""
        return {
            "name": self.model_name or "Not loaded",
            "version": self.model_version,
            "architecture": "DistilBERT",
            "dataset": self.dataset_name or "emotion",
            "classification_type": self.classification_type,
            "num_classes": len(self.labels),
            "labels": self.labels,
            "max_length": self.max_length,
            "device": self.device,
            "loaded": self.loaded,
            "load_time_seconds": round(self.load_time, 2),
            "parameters": sum(p.numel() for p in self.model.parameters()) if self.model else 0,
        }

    def get_status(self) -> dict:
        """Get current model status."""
        return {
            "loaded": self.loaded,
            "device": self.device,
            "model_name": self.model_name,
            "num_labels": len(self.labels),
            "load_time": round(self.load_time, 2),
        }


# Global singleton
model_manager = ModelManager()
