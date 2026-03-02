
import re
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

SUPPORTED_LANGUAGES = {
    "en", "hi", "te", "ta", "kn", "ml",
    "mr", "bn", "es", "fr", "de",
    "ar", "ko", "ja"
}


def detect_language(text: str) -> str:
    if not text or not text.strip():
        return "en"

    # 🔥 Script-based hard override (HIGHLY reliable)
    if re.search(r"[\u0C00-\u0C7F]", text):  # Telugu Unicode block
        return "te"

    if re.search(r"[\u0900-\u097F]", text):  # Devanagari (Hindi)
        return "hi"

    try:
        lang = detect(text)
        return lang if lang in SUPPORTED_LANGUAGES else "en"
    except:
        return "en"
