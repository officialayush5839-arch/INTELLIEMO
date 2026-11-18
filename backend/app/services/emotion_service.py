import re
import uuid
import logging
from typing import Optional

from app.ml.model_loader import model_manager
from app.ml.preprocessing import normalize_text, analyze_text_features, detect_language
from app.ml.explainability import explain_prediction
from app.ml.emotion_labels import get_emotion_description, get_emotion_color

logger = logging.getLogger(__name__)


def decompose_and_analyze_emotions(text: str, features: dict) -> dict:
    """
    Advanced Discourse & Multi-Emotion Decomposition Engine.
    Handles contrastive transitions ('but', 'however', 'after some time'),
    coordinating multi-emotion conjunctions ('and', 'as well as'),
    and lexical emotion indicators to accurately detect mixed, shifting,
    or compound emotional expressions without artificial softmax suppression.
    """
    labels = model_manager.labels
    global_prediction = model_manager.predict(text)
    global_probs = global_prediction.get("probabilities", {})

    contrastive_pattern = (
        r'\b(?:but|however|although|though|even\s+though|despite|in\s+spite\s+of|on\s+the\s+other\s+hand|yet|except|nonetheless|nevertheless|after\s+(?:some\s+time|that|a\s+while)|later\s+on|later|meanwhile|while)\b'
    )
    has_contrast = bool(re.search(contrastive_pattern, text, flags=re.IGNORECASE))
    clauses = [c.strip() for c in re.split(contrastive_pattern, text, flags=re.IGNORECASE) if c.strip()]
    has_coordinating = bool(re.search(r'\b(?:and|as well as|plus|along with|also)\b', text, flags=re.IGNORECASE))

    # Fast path: single clause without conjunctions
    if len(clauses) <= 1 and not has_coordinating:
        dom = global_prediction.get("dominant_emotion", "neutral")
        return {
            "dominant_emotion": dom,
            "secondary_emotion": None,
            "confidence": global_prediction.get("confidence", 0.0),
            "probabilities": global_probs,
            "is_mixed_emotion": False,
            "emotional_shift": None,
            "interpretation": get_emotion_description(dom),
        }

    # Clause-level analysis
    segment_emotions = []
    for clause_idx, clause in enumerate(clauses):
        # In contrastive discourse, terminal clauses receive higher weight (resolution state)
        clause_weight = 1.0 + (0.8 * clause_idx / max(1, len(clauses) - 1)) if len(clauses) > 1 else 1.0

        sub_parts = [s.strip() for s in re.split(r'\b(?:and|as well as|plus)\b', clause, flags=re.IGNORECASE) if s.strip()]
        for sub in sub_parts:
            norm_sub = sub
            if not re.search(r'\b(?:i|i\'m|am|feel|feeling|he|she|they|we|you|it)\b', sub, flags=re.IGNORECASE):
                norm_sub = "i am " + sub

            sub_pred = model_manager.predict(norm_sub)
            sub_probs = sub_pred.get("probabilities", {})
            sub_dom = sub_pred.get("dominant_emotion")
            sub_conf = sub_pred.get("confidence", 0.0)

            if sub_conf > 0.35:
                segment_emotions.append({
                    "segment": sub,
                    "dominant": sub_dom,
                    "probs": sub_probs,
                    "weight": clause_weight,
                    "is_terminal": clause_idx == len(clauses) - 1,
                })

    distinct_emotions = list(dict.fromkeys(s["dominant"] for s in segment_emotions))

    if len(distinct_emotions) > 1:
        # Multi-emotion detected across clauses / segments
        blended = {l: 0.005 for l in labels}
        for seg in segment_emotions:
            w = seg["weight"]
            for l in labels:
                blended[l] += seg["probs"].get(l, 0.0) * w

        sum_blended = sum(blended.values())
        blended = {l: round(v / sum_blended, 4) for l, v in blended.items()}

        terminal_segments = [s for s in segment_emotions if s["is_terminal"]]
        antecedent_segments = [s for s in segment_emotions if not s["is_terminal"]]

        sorted_emotions = sorted(blended.items(), key=lambda x: x[1], reverse=True)
        top_emotion, top_conf = sorted_emotions[0]
        sec_emotion, sec_conf = sorted_emotions[1]

        if antecedent_segments and terminal_segments:
            ant_emotions = list(dict.fromkeys(s["dominant"] for s in antecedent_segments))
            term_emotions = list(dict.fromkeys(s["dominant"] for s in terminal_segments))
            ant_str = " and ".join(ant_emotions)
            term_str = " and ".join(term_emotions)
            shift_desc = f"Transitioned from {ant_str} into {term_str}"
            interpretation = (
                f"The text expresses mixed and transitioning emotional states: "
                f"an earlier feeling of {ant_str} shifted over time into {term_str}."
            )
        else:
            shift_desc = f"Simultaneous {top_emotion} and {sec_emotion}"
            interpretation = (
                f"The text expresses simultaneous mixed emotions, combining elements of "
                f"{top_emotion} and {sec_emotion}."
            )

        return {
            "dominant_emotion": top_emotion,
            "secondary_emotion": sec_emotion,
            "confidence": top_conf,
            "probabilities": blended,
            "is_mixed_emotion": True,
            "emotional_shift": shift_desc,
            "interpretation": interpretation,
        }

    dom = global_prediction.get("dominant_emotion", "neutral")
    return {
        "dominant_emotion": dom,
        "secondary_emotion": None,
        "confidence": global_prediction.get("confidence", 0.0),
        "probabilities": global_probs,
        "is_mixed_emotion": False,
        "emotional_shift": None,
        "interpretation": get_emotion_description(dom),
    }


class EmotionService:
    """Service for analyzing text emotions."""

    def analyze(
        self,
        text: str,
        include_explanation: bool = True,
    ) -> dict:
        """
        Full analysis pipeline: preprocess → infer → explain.
        Returns a complete analysis result dict.
        """
        start_time = __import__("time").time()

        # Step 1: Validate
        if not text or not text.strip():
            raise ValueError("EMPTY_TEXT")

        # Step 2: Preprocess
        normalized = normalize_text(text)
        features = analyze_text_features(normalized)

        # Step 3: Discourse & Emotion Analysis
        emotion_res = decompose_and_analyze_emotions(normalized, features)
        dominant_emotion = emotion_res["dominant_emotion"]
        confidence = emotion_res["confidence"]
        probabilities = emotion_res["probabilities"]
        secondary_emotion = emotion_res.get("secondary_emotion")
        is_mixed_emotion = emotion_res.get("is_mixed_emotion", False)
        emotional_shift = emotion_res.get("emotional_shift")
        interpretation = emotion_res.get("interpretation") or get_emotion_description(dominant_emotion)

        # Step 4: Explanation
        explanation = None
        if include_explanation and (model_manager.loaded or getattr(model_manager, "is_fallback", False)):
            explanation_data = explain_prediction(normalized, dominant_emotion)
            explanation = explanation_data

        # Step 5: Timing
        total_time = (__import__("time").time() - start_time) * 1000

        # Step 6: Build response
        model_meta = model_manager.get_metadata()

        result = {
            "id": str(uuid.uuid4()),
            "text": text,
            "dominant_emotion": dominant_emotion,
            "secondary_emotion": secondary_emotion,
            "is_mixed_emotion": is_mixed_emotion,
            "emotional_shift": emotional_shift,
            "confidence": confidence,
            "probabilities": probabilities,
            "language": features.get("language", "en"),
            "word_count": features.get("word_count", 0),
            "character_count": features.get("character_count", 0),
            "processing_time_ms": round(total_time, 2),
            "model": {
                "name": model_meta.get("name", ""),
                "version": model_meta.get("version", "1.0.0"),
                "architecture": model_meta.get("architecture", "DistilBERT"),
            },
            "explanation": explanation,
            "interpretation": interpretation,
            "features": {
                "has_negation": features.get("has_negation", False),
                "has_intensifier": features.get("has_intensifier", False),
                "exclamation_count": features.get("exclamation_count", 0),
                "question_count": features.get("question_count", 0),
                "keywords": features.get("keywords", []),
            },
        }

        return result

    def analyze_batch(self, texts: list[str], include_explanation: bool = False) -> list[dict]:
        """Analyze a batch of texts."""
        results = []
        for i, text in enumerate(texts):
            try:
                result = self.analyze(text, include_explanation=include_explanation)
                result["id"] = i
                results.append(result)
            except Exception as e:
                results.append({
                    "id": i,
                    "text": text,
                    "error": str(e),
                    "dominant_emotion": "unknown",
                    "confidence": 0.0,
                    "probabilities": {},
                    "processing_time_ms": 0.0,
                })
        return results

    def get_supported_emotions(self) -> list[dict]:
        """Get list of supported emotions with metadata."""
        from app.ml.emotion_labels import (
            EMOTION_COLORS, EMOTION_ICONS, EMOTION_DESCRIPTIONS
        )
        emotions = []
        for label in model_manager.labels:
            emotions.append({
                "name": label,
                "color": EMOTION_COLORS.get(label, "#D1D5DB"),
                "icon": EMOTION_ICONS.get(label, "HelpCircle"),
                "description": EMOTION_DESCRIPTIONS.get(label, ""),
            })
        return emotions


emotion_service = EmotionService()
