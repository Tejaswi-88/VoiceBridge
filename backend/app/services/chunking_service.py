def chunk_text(text: str, chunk_size=900, overlap=180):
    chunks = []
    start = 0

    text = text.replace("\n\n", "\n").strip()

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Trim weak chunks
        if len(chunk.strip()) > 120:
            chunks.append(chunk.strip())

        start += chunk_size - overlap

    return chunks
