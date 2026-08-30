"""
Seed demo data for the INTELLIEMO dashboard.

Usage:
    python scripts/seed_demo_data.py

Generates realistic sample analyses marked as demo data.
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.database import SessionLocal, init_db
from app.db.models import Analysis
import uuid
from datetime import datetime, timedelta, timezone
import random

DEMO_ANALYSES = [
    {"text": "I finally got the job I've been working toward for months!", "dominant_emotion": "joy", "confidence": 0.947},
    {"text": "I can't believe you lied to me after everything I did for you.", "dominant_emotion": "anger", "confidence": 0.892},
    {"text": "I don't know what is going to happen tomorrow and it scares me.", "dominant_emotion": "fear", "confidence": 0.876},
    {"text": "Thank you so much for helping me when I needed it.", "dominant_emotion": "love", "confidence": 0.934},
    {"text": "That was completely unexpected, I'm so surprised!", "dominant_emotion": "surprise", "confidence": 0.912},
    {"text": "I feel so alone right now, nobody understands me.", "dominant_emotion": "sadness", "confidence": 0.889},
    {"text": "The sunset was absolutely breathtaking today.", "dominant_emotion": "joy", "confidence": 0.856},
    {"text": "I'm really worried about the exam results.", "dominant_emotion": "fear", "confidence": 0.823},
    {"text": "Congratulations on your promotion! You deserve it.", "dominant_emotion": "joy", "confidence": 0.918},
    {"text": "I hate when people don't keep their promises.", "dominant_emotion": "anger", "confidence": 0.867},
    {"text": "My dog passed away yesterday, I'm heartbroken.", "dominant_emotion": "sadness", "confidence": 0.956},
    {"text": "I love spending time with my family during holidays.", "dominant_emotion": "love", "confidence": 0.943},
    {"text": "The movie had an ending I never saw coming.", "dominant_emotion": "surprise", "confidence": 0.789},
    {"text": "I'm so grateful for everything you've done.", "dominant_emotion": "love", "confidence": 0.921},
    {"text": "This is the worst day of my entire life.", "dominant_emotion": "sadness", "confidence": 0.934},
    {"text": "I can't stop smiling, today was amazing!", "dominant_emotion": "joy", "confidence": 0.961},
    {"text": "The traffic was terrible, I'm so frustrated.", "dominant_emotion": "anger", "confidence": 0.845},
    {"text": "I have a really bad feeling about this.", "dominant_emotion": "fear", "confidence": 0.812},
    {"text": "You're the most important person in my life.", "dominant_emotion": "love", "confidence": 0.958},
    {"text": "Wait, what? That's not what I expected at all!", "dominant_emotion": "surprise", "confidence": 0.878},
]


def seed():
    """Seed demo data."""
    init_db()
    db = SessionLocal()

    try:
        count = 0
        now = datetime.now(timezone.utc)

        for i, demo in enumerate(DEMO_ANALYSES):
            # Spread dates over last 14 days
            days_ago = random.randint(0, 13)
            hours_ago = random.randint(0, 23)
            created_at = now - timedelta(days=days_ago, hours=hours_ago)

            # Generate probability distribution
            emotions = ["sadness", "joy", "love", "anger", "fear", "surprise"]
            probs = {}
            for emotion in emotions:
                if emotion == demo["dominant_emotion"]:
                    probs[emotion] = demo["confidence"]
                else:
                    remaining = 1.0 - demo["confidence"]
                    probs[emotion] = round(remaining / (len(emotions) - 1) * random.uniform(0.5, 1.5), 4)

            # Normalize probabilities
            total = sum(probs.values())
            probs = {k: round(v / total, 4) for k, v in probs.items()}

            word_count = len(demo["text"].split())

            analysis = Analysis(
                id=str(uuid.uuid4()),
                text=demo["text"],
                language="en",
                dominant_emotion=demo["dominant_emotion"],
                confidence=demo["confidence"],
                probabilities_json=probs,
                explanation_json={},
                word_count=word_count,
                character_count=len(demo["text"]),
                processing_time_ms=random.uniform(50, 200),
                is_demo=True,
                created_at=created_at,
            )
            db.add(analysis)
            count += 1

        db.commit()
        print(f"Seeded {count} demo analyses.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
