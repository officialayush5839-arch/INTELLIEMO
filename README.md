# INTELLIEMO

<div align="center">

# 🧠 INTELLIEMO
### Enterprise-Grade Text Emotion Intelligence & Explainable NLP Engine

*Understand the genuine human emotion, sentiment trajectory, and discourse shifts behind every sentence.*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Accuracy](https://img.shields.io/badge/Model_Accuracy-92.7%25-059669?style=for-the-badge&logo=target&logoColor=white)](#-model-benchmarks--evaluation)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#-license)

<br/>

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/officialayush5839-arch/INTELLIEMO)

</div>

---

## 📑 Executive Summary

**INTELLIEMO** is a production-ready, full-stack textual emotion intelligence system designed to analyze human language and identify granular emotional states, transition shifts, and confidence scores in real time.

Unlike standard single-keyword sentiment classifiers that only output binary *positive/negative* polarities, **INTELLIEMO** leverages a custom fine-tuned transformer model (**DistilBERT**, 67.0M parameters) combined with a specialized **Discourse-Aware Multi-Emotion Reasoning Engine**. It recognizes complex compound sentences containing conflicting and sequential emotional transitions (e.g. *"I was overjoyed at first, but after some time I became frustrated and anxious"*), accurately attributing co-dominant terminal states while preserving antecedent emotional context.

Every inference includes **Token-Drop Saliency Explainability (XAI)**, providing transparency into which tokens drove the model's classifications.

---

## ✨ Core Features

### 1. 🎯 Granular 6-Class Emotion Taxonomy
Classifies text across six core emotional dimensions:
- 🌟 **Joy** — happiness, delight, celebration, excitement
- 💙 **Sadness** — grief, disappointment, loneliness, depression
- 🔥 **Anger** — fury, irritation, indignation, outrage
- ⚡ **Fear** — anxiety, panic, terror, dread
- 💖 **Love** — affection, warmth, gratitude, deep affinity
- 💥 **Surprise** — shock, amazement, astonishment, sudden realization

### 2. 🔀 Discourse-Aware Multi-Emotion Engine
Standard transformer single-label models suffer from extreme softmax peakiness, allowing a single emotionally charged token to completely drown out explicit conflicting clauses. INTELLIEMO features:
- **Discourse Marker Segmentation**: Splits complex sentences along contrastive (`but`, `however`, `although`, `yet`) and temporal (`after some time`, `later`, `meanwhile`, `eventually`) boundaries.
- **Clause-Level Prediction**: Independently evaluates emotional weight across every clause.
- **Weighted Discourse Synthesis**: Concluding/prevailing clauses carry terminal weight (60–70%), while antecedent clauses retain proportional representation.
- **Emotional Transition Tracking**: Automatically generates human-interpretable shift narratives (e.g., *"Transitioned from joy into anger and sadness"*).

### 3. 🔬 Explainable AI (XAI) with Token Saliency
- Implements **Token-Drop Attribution** to calculate the exact counterfactual contribution of each word to the winning emotion logit.
- Visual token chips highlight positive emotional drivers (red/rose) versus neutral/inhibitory words (slate/blue).

### 4. 🚀 High-Throughput Batch Processing
- Upload multi-thousand-row CSV files for automated asynchronous processing.
- Real-time job progress tracking, batch emotion distribution charts, and instant export of annotated CSV files.

### 5. 📊 Model Observability & Comparative Suite
- Built-in machine learning benchmarking suite comparing fine-tuned DistilBERT against **TF-IDF + Support Vector Machines (SVM)** and **TF-IDF + Logistic Regression**.
- Interactive **Confusion Matrix Heatmap** displaying true-positive diagonal clusters and off-diagonal cross-class confusion.
- Per-class precision, recall, and F1-score performance tracking.

### 6. 🔒 100% Local & Privacy-Preserving Inference
- Runs entirely on local hardware (CPU or CUDA GPU).
- Zero third-party API dependencies (no OpenAI/Anthropic/Google keys required). Your text never leaves your infrastructure.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INTELLIEMO SYSTEM ARCHITECTURE                         │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ Client / Browser ]
        │
        ▼ (HTTP / JSON / Vite Proxy :7036)
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                              REACT 19 SPA (Vite + TypeScript)                        │
 │  ├── Dashboard Overview     ├── Text Analysis Suite       ├── Batch CSV Engine       │
 │  ├── Model Benchmarks Suite ├── Historical Telemetry      ├── Modern Design System   │
 └──────────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼ (REST API / ASGI :236)
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                              FASTAPI APPLICATION SERVER                              │
 │                                                                                      │
 │  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  │
 │  │ /api/v1/analyze        │  │ /api/v1/batch          │  │ /api/v1/model          │  │
 │  │ Text Emotion Pipeline  │  │ CSV File Ingestion     │  │ Metrics & Comparisons  │  │
 │  └───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘  │
 └──────────────┼───────────────────────────┼───────────────────────────┼───────────────┘
                │                           │                           │
                ▼                           ▼                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                              DISCOURSE & INFERENCE ENGINE                            │
 │                                                                                      │
 │  1. Text Normalization & Token Analysis (Regex, intensifiers, negation cues)         │
 │  2. Clause Decomposition (Contrastive markers: 'but', 'however', 'after some time')  │
 │  3. Clause-Level PyTorch Inference (AutoTokenizer + SequenceClassifier)             │
 │  4. Discourse-Weighted Synthesis (Terminal resolution + Antecedent preservation)     │
 │  5. Explainable Token Attribution (Drop sensitivity scoring)                         │
 └──────────────────────────────────────┬───────────────────────────────────────────────┘
                                        │
                                        ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────┐
 │                               STORAGE & PERSISTENCE LAYER                            │
 │  ├── SQLite Database (Analyses, Batch Jobs, Telemetry Logs, Settings)                │
 │  └── Model Weights Cache (DistilBERT safetensors / Offline Artifacts)               │
 └──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Model Benchmarks & Evaluation

Evaluated across **2,000 holdout test samples** on 6-class textual emotion distribution:

### Model Comparison Matrix

| Model Architecture | Accuracy | F1-Score (Macro) | F1-Score (Weighted) | Parameters | Inference Latency | Status |
|---|---|---|---|---|---|---|
| **DistilBERT (Ayush Vishwakarma's model)** | **92.7%** | **88.25%** | **92.69%** | **67.0M** | **82.7 ms** | **Active Production** |
| **TF-IDF + Support Vector Machine (SVM)** | 88.0% | 82.11% | 87.80% | ~50K features | 12.4 ms | Benchmark Baseline |
| **TF-IDF + Logistic Regression** | 86.15% | 79.40% | 85.90% | ~50K features | 8.2 ms | Benchmark Baseline |

### Per-Class Performance Breakdown

| Emotion Class | Precision | Recall | F1-Score | Holdout Samples | Primary Indicator Examples |
|---|---|---|---|---|---|
| **Sadness** | **96.89%** | **96.56%** | **96.72%** | 581 | *devastated, depressed, crying, lonely, heartbroken* |
| **Joy** | **94.93%** | **94.24%** | **94.58%** | 695 | *delighted, thrilled, celebrated, ecstatic, fortunate* |
| **Anger** | **92.59%** | **92.00%** | **92.29%** | 275 | *furious, outraged, irritating, repulsive, offensive* |
| **Fear** | **90.00%** | **88.98%** | **89.49%** | 224 | *terrified, alarmed, anxious, panic, terrified* |
| **Love** | **80.36%** | **84.91%** | **82.57%** | 159 | *cherish, adoration, beloved, romantic, affectionate* |
| **Surprise** | **78.95%** | **69.23%** | **73.77%** | 66 | *stunned, astonished, unbelievable, speechless* |

---

## ⚡ Quickstart

### Option A: One-Click Startup (Windows)

Simply double-click or execute the root batch launcher:

```bat
run.bat
```

This automated script will:
1. Validate Python and Node.js environments.
2. Initialize and activate the Python virtual environment.
3. Install backend dependencies and frontend node modules.
4. Auto-launch the **FastAPI Engine** on port `236` and **Vite SPA** on port `7036`.
5. Open your default web browser to the dashboard automatically.

To stop all services cleanly:
```bat
stop.bat
```

To view service status:
```bat
status.bat
```

---

### Option B: Manual Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/officialayush5839-arch/INTELLIEMO.git
cd INTELLIEMO
```

#### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 236 --reload
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Visit **`http://localhost:7036`** in your browser.

---

### Option C: Docker Deployment

```bash
docker-compose up --build -d
```

---

## 🔌 API Reference

The backend exposes interactive OpenAPI documentation:
- **Swagger UI**: `http://localhost:236/docs`
- **ReDoc**: `http://localhost:236/redoc`

### Single Text Analysis
```http
POST /api/v1/analyze
Content-Type: application/json
```

#### Request Payload:
```json
{
  "text": "i am happy but after some time i am angry and sad",
  "include_explanation": true
}
```

#### Response Payload (200 OK):
```json
{
  "id": "529c7772-be70-4985-bd48-22dc7d29f51d",
  "text": "i am happy but after some time i am angry and sad",
  "dominant_emotion": "sadness",
  "secondary_emotion": "anger",
  "is_mixed_emotion": true,
  "confidence": 0.3895,
  "emotional_shift": "Transitioned from joy into anger and sadness",
  "interpretation": "The text expresses mixed and transitioning emotional states: an earlier feeling of joy shifted over time into anger and sadness.",
  "probabilities": {
    "sadness": 0.3895,
    "anger": 0.3894,
    "joy": 0.2171,
    "love": 0.0014,
    "fear": 0.0015,
    "surprise": 0.0012
  },
  "explanation": {
    "method": "token_drop_attribution",
    "tokens": [
      { "token": "happy", "contribution": 0.21, "positive": true },
      { "token": "angry", "contribution": 0.38, "positive": true },
      { "token": "sad", "contribution": 0.39, "positive": true }
    ],
    "note": "Token importance reflects marginal logit impact."
  },
  "word_count": 11,
  "character_count": 48,
  "processing_time_ms": 78.4
}
```

---

## 📂 Project Structure

```
INTELLIEMO/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST route handlers (analyze, batch, analytics, model)
│   │   ├── core/                # Configuration, logging, lifecycle events
│   │   ├── db/                  # SQLAlchemy models, SQLite repository operations
│   │   ├── ml/                  # Model manager, inference engine, explainability, features
│   │   ├── schemas/             # Pydantic request/response validation schemas
│   │   └── services/            # EmotionService, ModelService, AnalyticsService
│   ├── requirements.txt         # Production Python dependencies
│   └── tests/                   # Backend unit and integration test suite
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API client & TanStack Query hooks
│   │   ├── layouts/             # DashboardLayout with responsive sidebar & ambient navigation
│   │   ├── pages/               # LandingPage, AnalyzeText, Analytics, ModelPage, Batch, History
│   │   ├── types/               # TypeScript interfaces & API contract types
│   │   └── index.css            # Tailwind CSS design tokens, glassmorphism, animations
│   ├── package.json             # Frontend dependencies (React 19, Recharts, Lucide, Tailwind)
│   └── vite.config.ts           # Vite proxy & build configuration
├── ml/
│   ├── training/                # PyTorch fine-tuning and checkpointing scripts
│   └── evaluation/              # Holdout evaluation, confusion matrix generation
├── models/
│   └── emotion_model/           # Pretrained model metadata & benchmark evaluation metrics
├── scripts/                     # Seed data generators & health probes
├── docker-compose.yml           # Multi-container orchestration
├── run.bat                      # Unified 1-click startup automation
├── stop.bat                     # Graceful service termination
└── README.md                    # Project documentation
```

---

## 🛡️ Responsible AI & Ethical Use

> **Disclaimer**: INTELLIEMO classifies probabilistic emotional patterns present in textual syntax and semantics. It is **not** a psychological or clinical diagnosis tool, does not measure physiological internal states, and should never be used as the sole basis for high-stakes employment, legal, medical, or diagnostic decisions.

---

## 👨‍💻 Creator & Maintainer

**Developed by Ayush Vishwakarma**
- **GitHub**: [@officialayush5839-arch](https://github.com/officialayush5839-arch)
- **Role**: AI & Machine Learning System Architect

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.
