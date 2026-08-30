"""Batch analysis service for processing CSV uploads."""

import csv
import io
import uuid
import logging
from collections import Counter
from typing import Optional

from sqlalchemy.orm import Session

from app.db.repositories import BatchJobRepository
from app.services.emotion_service import emotion_service

logger = logging.getLogger(__name__)


class BatchService:
    """Service for batch text analysis."""

    def process_csv(
        self,
        csv_content: str,
        db: Optional[Session] = None,
        include_explanation: bool = False,
    ) -> dict:
        """Process a CSV file with text column."""
        try:
            # Parse CSV
            reader = csv.DictReader(io.StringIO(csv_content))

            # Validate columns
            fieldnames = reader.fieldnames or []
            if "text" not in fieldnames:
                raise ValueError("CSV must contain a 'text' column")

            rows = list(reader)

            if not rows:
                raise ValueError("CSV is empty")

            if len(rows) > 100:
                raise ValueError("Maximum 100 records per batch")

            # Process each row
            results = []
            successful = 0
            failed = 0
            total_confidence = 0.0
            emotions = []

            for i, row in enumerate(rows):
                text = row.get("text", "").strip()
                if not text:
                    results.append({
                        "id": i,
                        "text": row.get("text", ""),
                        "error": "Empty text",
                        "predicted_emotion": "unknown",
                        "confidence": 0.0,
                        "probabilities": {},
                        "processing_time_ms": 0.0,
                    })
                    failed += 1
                    continue

                try:
                    result = emotion_service.analyze(
                        text,
                        include_explanation=include_explanation,
                    )
                    result["id"] = i
                    results.append({
                        "id": i,
                        "text": text,
                        "predicted_emotion": result["dominant_emotion"],
                        "confidence": result["confidence"],
                        "probabilities": result["probabilities"],
                        "processing_time_ms": result["processing_time_ms"],
                    })
                    successful += 1
                    total_confidence += result["confidence"]
                    emotions.append(result["dominant_emotion"])
                except Exception as e:
                    results.append({
                        "id": i,
                        "text": text,
                        "error": str(e),
                        "predicted_emotion": "unknown",
                        "confidence": 0.0,
                        "probabilities": {},
                        "processing_time_ms": 0.0,
                    })
                    failed += 1

            # Compute summary stats
            avg_confidence = total_confidence / successful if successful > 0 else 0.0
            most_common = Counter(emotions).most_common(1)[0][0] if emotions else "N/A"

            job_data = {
                "total_records": len(rows),
                "processed": successful + failed,
                "successful": successful,
                "failed": failed,
                "average_confidence": round(avg_confidence, 4),
                "most_common_emotion": most_common,
                "results_json": results,
                "status": "completed",
            }

            # Save to database if session provided
            job_id = str(uuid.uuid4())
            if db:
                repo = BatchJobRepository(db)
                job = repo.create(**job_data)
                job_id = job.id

            return {
                "job_id": job_id,
                "total_records": len(rows),
                "processed": successful + failed,
                "successful": successful,
                "failed": failed,
                "average_confidence": round(avg_confidence, 4),
                "most_common_emotion": most_common,
                "results": results,
            }

        except Exception as e:
            logger.error(f"Batch processing error: {e}")
            raise


batch_service = BatchService()
