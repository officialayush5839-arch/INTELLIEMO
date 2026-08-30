"""Emotion label definitions, colors, and descriptions."""

# ── 6-Emotion Model Labels ──
EMOTION_LABELS_6 = ["sadness", "joy", "love", "anger", "fear", "surprise"]

# ── GoEmotions Labels (28 classes) ──
EMOTION_LABELS_28 = [
    "admiration", "amusement", "anger", "annoyance", "approval",
    "caring", "confusion", "curiosity", "desire", "disappointment",
    "disapproval", "disgust", "embarrassment", "excitement", "fear",
    "gratitude", "grief", "joy", "love", "nervousness",
    "optimism", "pride", "realization", "relief", "remorse",
    "sadness", "surprise", "neutral"
]

# ── Emotion Colors ──
EMOTION_COLORS = {
    "joy": "#FCD34D",
    "sadness": "#93C5FD",
    "anger": "#FCA5A5",
    "fear": "#C4B5FD",
    "love": "#F9A8D4",
    "surprise": "#FDBA74",
    "neutral": "#D1D5DB",
    "admiration": "#86EFAC",
    "amusement": "#FDE047",
    "annoyance": "#FDBA74",
    "approval": "#A5F3FC",
    "caring": "#FCA5A5",
    "confusion": "#D8B4FE",
    "curiosity": "#67E8F9",
    "desire": "#F0ABFC",
    "disappointment": "#94A3B8",
    "disapproval": "#FB923C",
    "disgust": "#86EFAC",
    "embarrassment": "#FCA5A5",
    "excitement": "#FDE047",
    "gratitude": "#86EFAC",
    "grief": "#93C5FD",
    "nervousness": "#C4B5FD",
    "optimism": "#67E8F9",
    "pride": "#FDE047",
    "realization": "#A5F3FC",
    "relief": "#86EFAC",
    "remorse": "#94A3B8",
}

# ── Emotion Icons (Lucide icon names) ──
EMOTION_ICONS = {
    "joy": "Smile",
    "sadness": "Frown",
    "anger": "Flame",
    "fear": "AlertTriangle",
    "love": "Heart",
    "surprise": "Zap",
    "neutral": "Minus",
    "admiration": "ThumbsUp",
    "amusement": "Laugh",
    "annoyance": "XCircle",
    "approval": "CheckCircle",
    "caring": "HeartHandshake",
    "confusion": "HelpCircle",
    "curiosity": "Search",
    "desire": "Sparkles",
    "disappointment": "ArrowDown",
    "disapproval": "ThumbsDown",
    "disgust": "XOctagon",
    "embarrassment": "Blush",
    "excitement": "Rocket",
    "gratitude": "Gift",
    "grief": "CloudRain",
    "nervousness": "Activity",
    "optimism": "Sun",
    "pride": "Award",
    "realization": "Lightbulb",
    "relief": "Check",
    "remorse": "RotateCcw",
}

# ── Emotion Descriptions ──
EMOTION_DESCRIPTIONS = {
    "joy": "The text strongly expresses positive emotional engagement, achievement, or happiness.",
    "sadness": "The text expresses sorrow, loss, melancholy, or emotional pain.",
    "anger": "The text conveys frustration, irritation, displeasure, or indignation.",
    "fear": "The text expresses worry, anxiety, apprehension, or concern about potential outcomes.",
    "surprise": "The text conveys astonishment, unexpectedness, or a sudden reaction.",
    "love": "The text expresses deep affection, attachment, warmth, or romantic feelings.",
    "neutral": "The text is emotionally neutral and does not convey strong feelings.",
    "admiration": "The text expresses respect and warm approval.",
    "amusement": "The text conveys entertainment and humor.",
    "annoyance": "The text expresses mild irritation or displeasure.",
    "approval": "The text conveys acceptance or positive evaluation.",
    "caring": "The text expresses concern for others' wellbeing.",
    "confusion": "The text conveys puzzlement or lack of understanding.",
    "curiosity": "The text expresses interest in learning or discovering more.",
    "desire": "The text conveys longing, wish, or craving.",
    "disappointment": "The text expresses sadness from unmet expectations.",
    "disapproval": "The text conveys negative evaluation or rejection.",
    "disgust": "The text expresses revulsion or strong disapproval.",
    "embarrassment": "The text conveys discomfort from social awkwardness.",
    "excitement": "The text expresses enthusiastic anticipation or energy.",
    "gratitude": "The text conveys thankfulness and appreciation.",
    "grief": "The text expresses deep sorrow from loss.",
    "nervousness": "The text conveys unease or apprehension about upcoming events.",
    "optimism": "The text expresses hopefulness and positive expectations.",
    "pride": "The text conveys satisfaction from achievements or qualities.",
    "realization": "The text expresses a moment of sudden understanding.",
    "relief": "The text conveys comfort after anxiety or difficulty.",
    "remorse": "The text expresses regret or guilt for past actions.",
}


def get_emotion_color(emotion: str) -> str:
    """Get the display color for an emotion."""
    return EMOTION_COLORS.get(emotion, "#D1D5DB")


def get_emotion_description(emotion: str) -> str:
    """Get the description for an emotion."""
    return EMOTION_DESCRIPTIONS.get(emotion, "Emotional classification.")


def get_emotion_icon(emotion: str) -> str:
    """Get the icon name for an emotion."""
    return EMOTION_ICONS.get(emotion, "HelpCircle")


def get_all_labels(classification_type: str = "6-class") -> list[str]:
    """Get all emotion labels for a given classification type."""
    if classification_type == "28-class":
        return EMOTION_LABELS_28
    return EMOTION_LABELS_6
