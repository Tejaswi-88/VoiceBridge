from app.services.ai_client import generate_ai_response


async def summarize_messages(messages: list) -> str:
    if not messages:
        return ""

    history_text = "\n".join(
        [f"{m['role'].upper()}: {m['content']}" for m in messages]
    )

    prompt = [
        {
            "role": "system",
            "content": (
                "Summarize the following conversation into short memory notes. "
                "Keep only important facts, user preferences, goals, and unresolved issues."
            )
        },
        {"role": "user", "content": history_text}
    ]

    summary = await generate_ai_response(prompt)
    return summary
