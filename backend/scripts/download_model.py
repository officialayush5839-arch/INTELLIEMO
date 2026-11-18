"""Model Pre-Download Script for INTELLIEMO Deployment.

Downloads and saves the pretrained transformer model weights to the local
disk during the build phase so that runtime containers load in <1.5s
without cold-start network downloads.
"""

import os
import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODEL_REPO = "bhadresh-savani/distilbert-base-uncased-emotion"

def download_and_save():
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
    except ImportError:
        logger.error("transformers or torch not installed. Cannot download model.")
        sys.exit(1)

    # Determine paths
    current_dir = Path(__file__).resolve().parent
    backend_dir = current_dir.parent
    root_dir = backend_dir.parent

    target_dirs = [
        backend_dir / "models" / "emotion_model",
        root_dir / "models" / "emotion_model",
    ]

    primary_target = backend_dir / "models" / "emotion_model"
    primary_target.mkdir(parents=True, exist_ok=True)

    has_weights = (
        (primary_target / "model.safetensors").exists()
        or (primary_target / "pytorch_model.bin").exists()
    )
    if has_weights and (primary_target / "config.json").exists():
        logger.info(f"Model weights already exist at {primary_target}. Skipping download.")
        return

    logger.info(f"Downloading pretrained model '{MODEL_REPO}' from Hugging Face Hub...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_REPO)
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_REPO,
            low_cpu_mem_usage=True
        )

        for target in target_dirs:
            try:
                target.mkdir(parents=True, exist_ok=True)
                tokenizer.save_pretrained(str(target))
                model.save_pretrained(str(target))
                logger.info(f"Successfully saved model and tokenizer to {target}")
            except Exception as e:
                logger.warning(f"Could not save to {target}: {e}")

        logger.info("Build-time model download complete.")

    except Exception as e:
        logger.warning(f"Build-time model download failed: {e}. Runtime fallback will be used.")

if __name__ == "__main__":
    download_and_save()
