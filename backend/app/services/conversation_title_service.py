from app.services.ai_client import generate_ai_response


async def generate_conversation_title(first_user_message: str) -> str:
    prompt = [
        {
            "role": "system",
            "content": "Create a short, meaningful chat title (max 6 words)."
        },
        {"role": "user", "content": first_user_message}
    ]

    title = await generate_ai_response(prompt)
    return title.strip().replace('"', '')
