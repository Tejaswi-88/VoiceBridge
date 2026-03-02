from app.config import settings
import httpx

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_URL = "https://openrouter.ai/api/v1/embeddings"


async def generate_embedding(text: str):
    if not settings.OPENROUTER_API_KEY:
        return None

    if not text.strip():
        return None

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voicebridge.ai",
        "X-Title": "VoiceBridge Embeddings",
    }

    payload = {
        "model": EMBEDDING_MODEL,
        "input": text[:6000],
    }

    try:
        async with httpx.AsyncClient(
            timeout=30,
            trust_env=False,  # ✅ THIS is the only Windows fix you need
        ) as client:
            res = await client.post(
                EMBEDDING_URL,
                headers=headers,
                json=payload,
            )
            res.raise_for_status()
            return res.json()["data"][0]["embedding"]

    except Exception as e:
        print("❌ Embedding failed:", repr(e))
        return None
