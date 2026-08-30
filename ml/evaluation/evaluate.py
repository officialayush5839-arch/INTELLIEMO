"""
Model evaluation script.

Usage:
    python -m ml.evaluation.evaluate
"""

import os
import sys
import json
import time
from pathlib import Path

import torch
import numpy as np
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def evaluate(model_path: str = None, dataset_name: str = "dair-ai/emotion"):
    """Evaluate a trained emotion model."""
    if model_path is None:
        model_path = str(PROJECT_ROOT / "models" / "emotion_model")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Evaluating on device: {device}")

    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.to(device)
    model.eval()

    # Load dataset
    dataset = load_dataset(dataset_name)
    label_names = dataset["test"].features["label"].names

    # Tokenize test data
    def tokenize_fn(examples):
        return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=128)

    test_data = dataset["test"].map(tokenize_fn, batched=True)

    # Run inference
    all_preds = []
    all_labels = []
    all_probs = []
    inference_times = []

    for i in range(len(test_data)):
        inputs = {
            "input_ids": torch.tensor([test_data[i]["input_ids"]]).to(device),
            "attention_mask": torch.tensor([test_data[i]["attention_mask"]]).to(device),
        }

        start = time.time()
        with torch.no_grad():
            outputs = model(**inputs)
        elapsed = (time.time() - start) * 1000
        inference_times.append(elapsed)

        probs = torch.softmax(outputs.logits, dim=-1)[0].cpu().numpy()
        pred = np.argmax(probs)
        all_preds.append(pred)
        all_labels.append(test_data[i]["label"])
        all_probs.append(probs)

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    all_probs = np.array(all_probs)

    # Compute metrics
    acc = accuracy_score(all_labels, all_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(
        all_labels, all_preds, average="macro"
    )
    _, _, f1_weighted, _ = precision_recall_fscore_support(
        all_labels, all_preds, average="weighted"
    )

    # Per-class metrics
    report = classification_report(all_labels, all_preds, target_names=label_names, output_dict=True)
    per_class = {}
    for name in label_names:
        per_class[name] = {
            "precision": report[name]["precision"],
            "recall": report[name]["recall"],
            "f1-score": report[name]["f1-score"],
            "support": int(report[name]["support"]),
        }

    # Confusion matrix
    cm = confusion_matrix(all_labels, all_preds).tolist()

    # AUC (one-vs-rest)
    try:
        auc = roc_auc_score(all_labels, all_probs, multi_class="ovr", average="macro")
    except Exception:
        auc = None

    # Inference stats
    avg_latency = np.mean(inference_times)

    results = {
        "accuracy": float(acc),
        "precision_macro": float(precision),
        "recall_macro": float(recall),
        "f1_macro": float(f1),
        "f1_weighted": float(f1_weighted),
        "auc_roc": float(auc) if auc else None,
        "per_class": per_class,
        "confusion_matrix": cm,
        "labels": label_names,
        "avg_inference_latency_ms": float(avg_latency),
        "total_samples": len(test_data),
    }

    # Save results
    output_path = os.path.join(model_path, "evaluation_results.json")
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nEvaluation Results:")
    print(f"  Accuracy:     {acc:.4f}")
    print(f"  F1 Macro:     {f1:.4f}")
    print(f"  F1 Weighted:  {f1_weighted:.4f}")
    print(f"  AUC-ROC:      {auc:.4f}" if auc else "  AUC-ROC:      N/A")
    print(f"  Avg Latency:  {avg_latency:.2f}ms")
    print(f"  Saved to:     {output_path}")

    return results


if __name__ == "__main__":
    evaluate()
