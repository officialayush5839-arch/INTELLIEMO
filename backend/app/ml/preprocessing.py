"""NLP preprocessing module for text normalization and cleaning."""

import re
import unicodedata
from typing import Optional


# Emotion keywords for additional features
EMOTION_INDICATORS = {
    "joy": ["happy", "glad", "excited", "wonderful", "great", "love", "amazing", "fantastic", "thrilled"],
    "sadness": ["sad", "sorry", "unfortunately", "miss", "lost", "pain", "hurt", "lonely", "depressed"],
    "anger": ["angry", "furious", "hate", "annoyed", "frustrated", "mad", "livid", "outraged"],
    "fear": ["scared", "afraid", "worried", "nervous", "terrified", "anxious", "frightened", "panic"],
    "surprise": ["wow", "omg", "unexpected", "shocked", "unbelievable", "astonished", "stunned"],
    "love": ["love", "adore", "cherish", "devoted", "affection", "heart", "darling", "beloved"],
}


def normalize_unicode(text: str) -> str:
    """Normalize unicode characters."""
    return unicodedata.normalize("NFKC", text)


def clean_whitespace(text: str) -> str:
    """Clean excess whitespace while preserving meaningful line breaks."""
    text = re.sub(r"[^\S\n]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def handle_urls(text: str) -> str:
    """Replace URLs with a placeholder."""
    return re.sub(r"https?://\S+|www\.\S+", "[URL]", text)


def handle_mentions(text: str) -> str:
    """Replace @mentions with a placeholder."""
    return re.sub(r"@\w+", "[USER]", text)


def handle_hashtags(text: str) -> str:
    """Convert hashtags to plain text (keep the word)."""
    return re.sub(r"#(\w+)", r"\1", text)


def handle_repeated_characters(text: str) -> str:
    """Reduce repeated characters (e.g., 'soooo' -> 'soo')."""
    return re.sub(r"(.)\1{2,}", r"\1\1", text)


def normalize_text(text: str) -> str:
    """
    Apply all normalization steps.
    Important: does NOT remove punctuation, negations, or emotional intensifiers.
    """
    text = normalize_unicode(text)
    text = handle_urls(text)
    text = handle_mentions(text)
    text = handle_hashtags(text)
    text = handle_repeated_characters(text)
    text = clean_whitespace(text)
    return text


def detect_language(text: str) -> str:
    """Detect text language using langdetect."""
    try:
        from langdetect import detect
        lang = detect(text)
        return lang
    except Exception:
        return "en"


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def count_sentences(text: str) -> int:
    """Count sentences in text."""
    sentences = re.split(r"[.!?]+", text)
    return max(1, len([s for s in sentences if s.strip()]))


def count_characters(text: str) -> int:
    """Count characters in text."""
    return len(text)


def extract_keywords(text: str) -> list[str]:
    """Extract emotionally significant keywords from text."""
    words = re.findall(r"\b\w+\b", text.lower())
    keywords = []
    for category, indicators in EMOTION_INDICATORS.items():
        for word in words:
            if word in indicators and word not in keywords:
                keywords.append(word)
    return keywords


def analyze_text_features(text: str) -> dict:
    """Extract comprehensive text features for insights."""
    return {
        "word_count": count_words(text),
        "character_count": count_characters(text),
        "sentence_count": count_sentences(text),
        "language": detect_language(text),
        "keywords": extract_keywords(text),
        "has_negation": bool(re.search(r"\b(not|no|never|neither|nobody|nothing|nowhere|nor|can't|don't|won't|isn't|aren't|wasn't|weren't)\b", text.lower())),
        "has_intensifier": bool(re.search(r"\b(very|extremely|incredibly|absolutely|totally|completely|really|so|super)\b", text.lower())),
        "exclamation_count": text.count("!"),
        "question_count": text.count("?"),
    }
