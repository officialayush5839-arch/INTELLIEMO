# Models Directory

This directory stores trained model artifacts.

## How to Get Models

### Option 1: Train from Scratch
```bash
python -m ml.training.train
```

### Option 2: Auto-Loading
The application automatically loads `bhadresh-savani/distilbert-base-uncased-emotion` from HuggingFace Hub if no local model is found.

## Files Generated After Training
- `config.json` — Model configuration
- `model.safetensors` — Model weights
- `tokenizer.json` — Tokenizer
- `vocab.txt` — Vocabulary
- `metrics.json` — Evaluation metrics
- `training_config.json` — Training parameters

## Model Size
DistilBERT: ~268MB (will be downloaded on first run)
