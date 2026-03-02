from app.config import settings
import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def generate_ai_response(messages: list):
    if not settings.OPENROUTER_API_KEY:
        raise Exception("OPENROUTER_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voicebridge.ai",
        "X-Title": "VoiceBridge AI",
    }

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 800,
        "top_p": 0.9,
    }

    async with httpx.AsyncClient(
        timeout=40,
        trust_env=False,  # ✅ same fix here
    ) as client:
        res = await client.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]
