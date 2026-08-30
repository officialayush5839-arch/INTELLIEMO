# INTELLIEMO Architecture

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    User Interface                     │
│              React + TypeScript + Vite                │
│         Tailwind CSS / Recharts / TanStack Query      │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP
┌──────────────────────▼───────────────────────────────┐
│                   FastAPI REST API                    │
│              /api/v1/* endpoints                      │
└───────┬──────────────┬──────────────────────┬────────┘
        │              │                      │
┌───────▼──────┐ ┌─────▼──────┐  ┌───────────▼────────┐
│   Emotion    │ │  Batch     │  │    Analytics       │
│   Service    │ │  Service   │  │    Service          │
└───────┬──────┘ └─────┬──────┘  └───────────┬────────┘
        │              │                      │
┌───────▼──────────────▼──────────────────────▼────────┐
│              NLP Preprocessing Pipeline               │
│    normalize → tokenize → clean → extract features    │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│           Transformer Model (DistilBERT)              │
│      Fine-tuned for emotion classification           │
│              PyTorch + HuggingFace                    │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│              Explainability Layer                      │
│         Token attribution / gradient-based            │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│          Database (SQLite + SQLAlchemy)               │
│     analyses / batch_jobs / model_versions            │
└──────────────────────────────────────────────────────┘
```

## Request Flow

```
POST /api/v1/emotion/analyze
        │
        ▼
   API Validation (Pydantic)
        │
        ▼
   Text Preprocessing
   - Unicode normalization
   - URL/mention handling
   - Whitespace cleaning
        │
        ▼
   Tokenization (WordPiece)
   - Input IDs
   - Attention mask
        │
        ▼
   Model Inference (DistilBERT)
   - Forward pass
   - Logits → Softmax
        │
        ▼
   Post-processing
   - Probability extraction
   - Thresholding
   - Dominant emotion selection
        │
        ▼
   Explainability
   - Gradient-based attribution
   - Token importance ranking
        │
        ▼
   Database Persistence
        │
        ▼
   JSON Response → Frontend Visualization
```

## Module Responsibilities

### Backend
- **api/routes/** — HTTP endpoint handlers
- **core/** — Configuration, logging
- **db/** — Database models, session management, repositories
- **schemas/** — Pydantic request/response validation
- **services/** — Business logic (emotion, batch, analytics, model)
- **ml/** — Model loading, preprocessing, explainability

### ML Pipeline
- **preprocessing/** — Text normalization, language detection, feature extraction
- **training/** — Model fine-tuning on emotion datasets
- **evaluation/** — Metric computation, confusion matrix, per-class analysis
- **inference/** — Runtime prediction pipeline
- **explainability/** — Token-level attribution methods

### Frontend
- **pages/** — Route-level components
- **layouts/** — Dashboard layout with sidebar
- **api/** — Axios-based API client
- **types/** — TypeScript type definitions
- **utils/** — Formatting, color mapping, utilities
