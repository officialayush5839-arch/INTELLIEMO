"""Backend API tests."""

import sys
import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import init_db
from app.main import create_app

init_db()
app = create_app()
client = TestClient(app)


def test_health():
    """Test health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "model_loaded" in data


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    if "application/json" in response.headers.get("content-type", ""):
        data = response.json()
        assert data["name"] == "INTELLIEMO"
    else:
        assert "<!doctype html" in response.text.lower() or "<html" in response.text.lower()


def test_model_info():
    """Test model info endpoint."""
    response = client.get("/api/v1/model")
    assert response.status_code == 200
    data = response.json()
    assert "architecture" in data
    assert "labels" in data


def test_model_status():
    """Test model status endpoint."""
    response = client.get("/api/v1/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "loaded" in data
    assert "device" in data


def test_analytics_summary():
    """Test analytics summary endpoint."""
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyses" in data
    assert "emotion_distribution" in data


def test_history():
    """Test history endpoint."""
    response = client.get("/api/v1/analyses")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


def test_emotions_list():
    """Test emotions list endpoint."""
    response = client.get("/api/v1/emotions")
    assert response.status_code == 200
    data = response.json()
    assert "emotions" in data


def test_analyze_endpoint_success():
    """Test analyze endpoint returns 200 and valid predictions even during cold starts."""
    response = client.post("/api/v1/analyze", json={"text": "i love you", "include_explanation": True})
    assert response.status_code == 200
    data = response.json()
    assert "dominant_emotion" in data
    assert data["dominant_emotion"] in ["love", "joy", "admiration"]
    assert "probabilities" in data
    assert "confidence" in data
    assert data["confidence"] > 0.0


def test_analyze_endpoint_empty_text():
    """Test analyze endpoint handles empty text validation."""
    response = client.post("/api/v1/analyze", json={"text": "   ", "include_explanation": False})
    assert response.status_code == 400
