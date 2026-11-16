"""Batch analysis API endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.batch_service import batch_service
from app.ml.model_loader import model_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze/batch",
    summary="Batch analyze text from CSV upload",
)
def batch_analyze(
    file: UploadFile = File(..., description="CSV file with 'text' column"),
    db: Session = Depends(get_db),
):
    """
    Upload a CSV file for batch emotion analysis.

    CSV must contain a 'text' column. Optional columns: id, source, category.
    Maximum 100 records per batch.
    """
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "NO_FILE", "message": "No file uploaded."}},
        )

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_FILE_TYPE", "message": "Only CSV files are accepted."}},
        )

    if not model_manager.loaded:
        raise HTTPException(
            status_code=503,
            detail={"error": {"code": "MODEL_UNAVAILABLE", "message": "Emotion model is not loaded."}},
        )

    try:
        content = file.file.read()

        # Check file size (max 5MB)
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail={"error": {"code": "FILE_TOO_LARGE", "message": "File must be under 5MB."}},
            )

        csv_text = content.decode("utf-8")
        result = batch_service.process_csv(csv_text, db=db)
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_CSV", "message": str(e)}},
        )
    except Exception as e:
        logger.error(f"Batch processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "BATCH_ERROR", "message": "Batch processing failed."}},
        )
