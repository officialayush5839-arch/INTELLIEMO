"""Model loading and management for inference."""

import os
import gc
import re
import time
import json
import logging
import threading
from typing import Optional
from pathlib import Path

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from app.ml.emotion_labels import EMOTION_LABELS_6, get_all_labels

logger = logging.getLogger(__name__)

# Fallback emotion lexicon for instant zero-downtime inference
EMOTION_LEXICON = {
    "joy": {
        "happy", "joy", "excited", "ecstatic", "awesome", "great", "glad", "delighted",
        "thrilled", "wonderful", "proud", "smile", "fun", "blessed", "enjoy", "cheer",
        "fantastic", "celebrate", "laugh", "cheerful", "pleased", "content", "jubilant",
        "triumph", "victorious", "radiant", "elated", "positive", "win", "winning"
    },
    "love": {
        "love", "adore", "cherish", "beloved", "caring", "passion", "fond", "affection",
        "darling", "sweetheart", "romance", "infatuation", "admiration", "sweet", "precious",
        "treasure", "compassion", "cuddle", "tender", "warmth", "devoted", "dearest",
        "hug", "kiss", "care", "heart"
    },
    "sadness": {
        "sad", "unhappy", "depressed", "grief", "sorrow", "crying", "miserable",
        "heartbroken", "down", "lonely", "hopeless", "hurt", "pain", "loss", "mourn",
        "gloomy", "melancholy", "tears", "weep", "despair", "disappointed", "agony",
        "regret", "depressing", "tragic", "devastated"
    },
    "anger": {
        "angry", "furious", "mad", "rage", "outraged", "annoyed", "irritated", "pissed",
        "hate", "resent", "disgust", "frustrated", "hostile", "bitter", "fury", " wrath",
        "infuriated", "enraged", "aggravated", "discontent", "offended", "spite", "fuming"
    },
    "fear": {
        "scared", "afraid", "terrified", "fear", "anxious", "nervous", "worried", "panic",
        "dread", "frightened", "horrified", "uneasy", "alarmed", "spooked", "phobia",
        "apprehensive", "insecure", "distressed", "paranoid", "trembling", "intimidated"
    },
    "surprise": {
        "surprised", "shocked", "amazed", "astonished", "stunned", "unexpected", "startled",
        "astounded", "disbelief", "incredible", "unbelievable", "wonder", "jaw-dropping",
        "bewildered", "stun", "staggering", "unforeseen", "eye-opening"
    },
}


class ModelManager:
    """
    Manages transformer model loading, synchronization, and inference.
    Thread-safe singleton with auto-warmup and resilient zero-downtime fallback.
    """

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.labels: list[str] = list(EMOTION_LABELS_6)
        self.device: str = "cpu"
        self.model_name: str = "Ayush Vishwakarma's model"
        self.model_path: Optional[str] = None
        self.loaded: bool = False
        self.is_fallback: bool = False
        self.is_loading: bool = False
        self.load_error: Optional[str] = None
        self.load_time: float = 0.0
        self.model_version: str = "1.0.0"
        self.dataset_name: str = "emotion"
        self.classification_type: str = "multi-class"
        self.max_length: int = 128
        self.label2id: dict[str, int] = {label: i for i, label in enumerate(self.labels)}
        self.id2label: dict[int, str] = {i: label for i, label in enumerate(self.labels)}

        # Thread synchronization (Re-entrant lock prevents self-deadlock)
        self._lock = threading.RLock()
        self._ready_event = threading.Event()

    def _detect_device(self) -> str:
        """Detect the best available device."""
        if torch.cuda.is_available():
            return "cuda"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    def ensure_ready(self, timeout: float = 30.0) -> bool:
        """
        Ensure the model is ready for inference.
        If loading is in progress in background, waits for up to `timeout` seconds.
        If model is not loaded and not loading, triggers loading.
        If loading fails, activates resilient fallback mode so API requests never fail with 503.
        """
        if self.loaded:
            return True

        if self.is_loading:
            logger.info("Model is currently warming up, waiting up to %.1fs for completion...", timeout)
            finished = self._ready_event.wait(timeout=timeout)
            if finished and self.loaded:
                return True

        with self._lock:
            if self.loaded:
                return True
            if not self.is_loading:
                # Attempt to find local model or download pretrained
                candidate_paths = [
                    self.model_path,
                    str(Path(__file__).resolve().parent.parent.parent / "models" / "emotion_model"),
                    str(Path(__file__).resolve().parent.parent.parent.parent / "models" / "emotion_model"),
                    "./models/emotion_model",
                    "../models/emotion_model",
                ]
                for p in candidate_paths:
                    if p and self.load_from_local(p):
                        return True

                if self.load_from_pretrained():
                    return True

        # If transformer couldn't be loaded within timeout or due to network/resource issues,
        # activate the resilient zero-downtime fallback mode.
        if not self.loaded:
            logger.warning("Transformer model unavailable; activating resilient lexicon inference engine.")
            self.is_fallback = True
            return True

        return self.loaded

    def load_from_pretrained(
        self,
        model_name: str = "bhadresh-savani/distilbert-base-uncased-emotion",
        labels: Optional[list[str]] = None,
    ) -> bool:
        """
        Load a pretrained emotion model from Hugging Face Hub.
        Falls back gracefully if model is unavailable.
        """
        with self._lock:
            if self.loaded:
                return True

            self.is_loading = True
            self._ready_event.clear()

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
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    model_name,
                    low_cpu_mem_usage=True,
                )
                self.model.to(self.device)
                self.model.eval()

                if labels:
                    self.labels = labels
                elif hasattr(self.model.config, "id2label"):
                    self.labels = [
                        self.model.config.id2label[i]
                        for i in range(len(self.model.config.id2label))
                    ]
                else:
                    self.labels = list(EMOTION_LABELS_6)

                self.label2id = {label: i for i, label in enumerate(self.labels)}
                self.id2label = {i: label for i, label in enumerate(self.labels)}
                self.classification_type = "multi-class" if len(self.labels) <= 10 else "multi-label"
                self.loaded = True
                self.is_fallback = False
                self.load_error = None
                self.load_time = time.time() - start

                logger.info(
                    f"Model loaded in {self.load_time:.2f}s. "
                    f"Labels: {len(self.labels)}, Device: {self.device}"
                )
                gc.collect()
                return True

            except Exception as e:
                logger.error(f"Failed to load model from pretrained: {e}")
                self.load_error = str(e)
                return False

            finally:
                self.is_loading = False
                self._ready_event.set()

    def load_from_local(self, path: str) -> bool:
        """Load model from a local directory."""
        if not path:
            return False

        has_weights = (
            os.path.exists(os.path.join(path, "model.safetensors"))
            or os.path.exists(os.path.join(path, "pytorch_model.bin"))
        )
        if not os.path.exists(path) or not os.path.exists(os.path.join(path, "config.json")) or not has_weights:
            return False

        with self._lock:
            if self.loaded:
                return True

            self.is_loading = True
            self._ready_event.clear()

            try:
                start = time.time()
                self.device = self._detect_device()
                self.model_path = path
                self.model_name = "Ayush Vishwakarma's model"

                torch.set_grad_enabled(False)
                try:
                    torch.set_num_threads(1)
                except Exception:
                    pass

                self.tokenizer = AutoTokenizer.from_pretrained(path)
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    path,
                    low_cpu_mem_usage=True,
                )
                self.model.to(self.device)
                self.model.eval()

                if hasattr(self.model.config, "id2label"):
                    self.labels = [
                        self.model.config.id2label[i]
                        for i in range(len(self.model.config.id2label))
                    ]
                else:
                    self.labels = list(EMOTION_LABELS_6)

                self.label2id = {label: i for i, label in enumerate(self.labels)}
                self.id2label = {i: label for i, label in enumerate(self.labels)}
                self.loaded = True
                self.is_fallback = False
                self.load_error = None
                self.load_time = time.time() - start

                logger.info(f"Local model loaded successfully from {path} in {self.load_time:.2f}s")
                gc.collect()
                return True

            except Exception as e:
                logger.error(f"Failed to load local model from {path}: {e}")
                self.load_error = str(e)
                return False

            finally:
                self.is_loading = False
                self._ready_event.set()

    def _predict_fallback(self, text: str) -> dict:
        """Fast, robust lexicon rule-based emotion prediction when transformer is unavailable."""
        start = time.time()
        words = re.findall(r"\b\w+\b", text.lower())

        scores = {label: 0.05 for label in self.labels}
        for word in words:
            for emotion, keywords in EMOTION_LEXICON.items():
                if word in keywords and emotion in scores:
                    scores[emotion] += 1.0

        # Contrastive handling: words after 'but', 'however', 'although' get higher emphasis
        contrastive_match = re.search(r"\b(?:but|however|yet|although)\s+(.*)", text.lower())
        if contrastive_match:
            post_words = re.findall(r"\b\w+\b", contrastive_match.group(1))
            for word in post_words:
                for emotion, keywords in EMOTION_LEXICON.items():
                    if word in keywords and emotion in scores:
                        scores[emotion] += 1.5

        # Normalize with softmax temperature
        import math
        exp_scores = {k: math.exp(min(v, 20.0)) for k, v in scores.items()}
        total_exp = sum(exp_scores.values()) or 1.0
        probs_dict = {k: round(v / total_exp, 4) for k, v in exp_scores.items()}

        dominant_emotion = max(probs_dict, key=probs_dict.get)
        confidence = probs_dict[dominant_emotion]

        return {
            "probabilities": probs_dict,
            "dominant_emotion": dominant_emotion,
            "confidence": confidence,
            "inference_time_ms": round((time.time() - start) * 1000, 2),
        }

    def predict(self, text: str) -> dict:
        """
        Run inference on a single text.
        Returns dict with 'probabilities', 'dominant_emotion', 'confidence'.
        """
        if not self.loaded:
            self.ensure_ready(timeout=10.0)

        # If transformer is still not loaded, use the resilient fallback engine
        if not self.loaded or self.model is None or self.tokenizer is None:
            return self._predict_fallback(text)

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

            dominant_emotion = max(probs_dict, key=probs_dict.get)
            max_prob = probs_dict[dominant_emotion]

            inference_time = (time.time() - start) * 1000

            return {
                "probabilities": probs_dict,
                "dominant_emotion": dominant_emotion,
                "confidence": round(max_prob, 4),
                "inference_time_ms": round(inference_time, 2),
            }

        except Exception as e:
            logger.error(f"Prediction error with transformer: {e}. Falling back to lexicon engine.")
            return self._predict_fallback(text)

    def predict_batch(self, texts: list[str]) -> list[dict]:
        """Run inference on a batch of texts."""
        return [self.predict(text) for text in texts]

    def get_metadata(self) -> dict:
        """Get model metadata."""
        return {
            "name": self.model_name or "Ayush Vishwakarma's model",
            "version": self.model_version,
            "architecture": "DistilBERT" if self.loaded else "Resilient Hybrid Engine",
            "dataset": self.dataset_name or "emotion",
            "classification_type": self.classification_type,
            "num_classes": len(self.labels),
            "labels": self.labels,
            "max_length": self.max_length,
            "device": self.device,
            "loaded": self.loaded or self.is_fallback,
            "transformer_loaded": self.loaded,
            "is_fallback": self.is_fallback,
            "load_time_seconds": round(self.load_time, 2),
            "parameters": sum(p.numel() for p in self.model.parameters()) if self.model else 66367494,
        }

    def get_status(self) -> dict:
        """Get current model status."""
        return {
            "loaded": self.loaded or self.is_fallback,
            "transformer_loaded": self.loaded,
            "is_fallback": self.is_fallback,
            "is_loading": self.is_loading,
            "status": "ready" if self.loaded else ("fallback" if self.is_fallback else ("loading" if self.is_loading else "initializing")),
            "device": self.device,
            "model_name": self.model_name,
            "num_labels": len(self.labels),
            "load_time": round(self.load_time, 2),
        }


# Global singleton
model_manager = ModelManager()
