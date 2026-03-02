ROLE_TONE = {
    1: "friendly student helper",
    2: "friendly family assistant",
    3: "professional faculty assistant",
    4: "professional admin assistant",
    5: "professional admin assistant",
}

LANGUAGE_TONE_HINTS = {
    "hi": "Speak politely in Hindi.",
    "te": "Speak naturally in Telugu.",
    "ta": "Speak warmly in Tamil.",
    "kn": "Speak clearly in Kannada.",
    "ml": "Speak gently in Malayalam.",
    "mr": "Speak casually in Marathi.",
    "bn": "Speak respectfully in Bengali.",
}


def build_tone_prompt(role_id: int, language: str) -> str:
    base = ROLE_TONE.get(role_id, "friendly assistant")
    lang_hint = LANGUAGE_TONE_HINTS.get(language, "")
    return f"You are a {base}. {lang_hint} Keep replies short unless needed."
