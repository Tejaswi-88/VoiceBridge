from deep_translator import GoogleTranslator


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    if source_lang == target_lang:
        return text

    try:
        return GoogleTranslator(source=source_lang, target=target_lang).translate(text)
    except:
        return text  # fail silently
