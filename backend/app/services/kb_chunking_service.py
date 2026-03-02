import re

def split_into_chunks(
    text: str,
    max_chars: int = 800,
    overlap: int = 150
) -> list[str]:

    if not text or not text.strip():
        return []

    text = text.strip()

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + max_chars

        chunk = text[start:end]
        chunks.append(chunk.strip())

        start = end - overlap

    return [c for c in chunks if len(c) > 100]