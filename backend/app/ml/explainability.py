"""Explainability module for model predictions."""

import torch
from typing import Optional
from app.ml.model_loader import model_manager


def explain_prediction(text: str, target_emotion: Optional[str] = None) -> dict:
    """
    Generate token-level explanations using token-drop attribution.
    Measures how much removing each token changes the prediction.
    """
    if not model_manager.loaded:
        return {
            "method": "unavailable",
            "tokens": [],
            "note": "Model not loaded.",
        }

    try:
        tokenizer = model_manager.tokenizer
        model = model_manager.model
        device = model_manager.device
        model.eval()

        # Tokenize
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=model_manager.max_length,
        )
        input_ids = inputs["input_ids"].to(device)
        attention_mask = inputs["attention_mask"].to(device)

        # Baseline prediction
        with torch.no_grad():
            baseline_outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            baseline_probs = torch.softmax(baseline_outputs.logits, dim=-1)[0]

        # Target class
        if target_emotion and target_emotion in model_manager.label2id:
            target_idx = model_manager.label2id[target_emotion]
        else:
            target_idx = torch.argmax(baseline_probs).item()

        baseline_score = baseline_probs[target_idx].item()
        tokens = tokenizer.convert_ids_to_tokens(input_ids[0])
        pad_token_id = tokenizer.pad_token_id or 0

        token_scores = []
        for i, token in enumerate(tokens):
            if token in ["[CLS]", "[SEP]", "[PAD]"]:
                continue

            # Replace token with pad token
            masked_ids = input_ids.clone()
            masked_ids[0, i] = pad_token_id

            with torch.no_grad():
                masked_outputs = model(input_ids=masked_ids, attention_mask=attention_mask)
                masked_probs = torch.softmax(masked_outputs.logits, dim=-1)[0]

            masked_score = masked_probs[target_idx].item()
            contribution = baseline_score - masked_score

            token_scores.append({
                "token": token,
                "contribution": round(max(0.0, contribution), 4),
                "positive": contribution > 0.01,
            })

        # Sort by contribution
        token_scores.sort(key=lambda x: x["contribution"], reverse=True)

        return {
            "method": "token_drop_attribution",
            "tokens": token_scores[:15],
            "target_emotion": model_manager.labels[target_idx],
            "baseline_confidence": round(baseline_score, 4),
            "note": (
                "Explanations measure token importance by observing how removing each "
                "token affects the model prediction. They should not be interpreted as "
                "human psychological reasoning."
            ),
        }

    except Exception as e:
        return {
            "method": "error",
            "tokens": [],
            "note": f"Explanation generation failed: {str(e)}",
        }
