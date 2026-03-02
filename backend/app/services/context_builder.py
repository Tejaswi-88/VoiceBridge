def build_context_prompt(
    *,
    kb_chunks=None,
    faqs=None,
    contacts=None,
):
    kb_chunks = kb_chunks or []
    faqs = faqs or []
    contacts = contacts or []

    parts = []

    if kb_chunks:
        parts.append("📘 KNOWLEDGE BASE")
        for c in kb_chunks:
            parts.append(
                f"[Source: {c.source_file}]\n{c.chunk_text}"
            )

    if faqs:
        parts.append("\n❓ FREQUENTLY ASKED QUESTIONS")
        for f in faqs:
            parts.append(
                f"Q: {f.question}\nA: {f.answer}"
            )

    if contacts:
        parts.append("\n📞 IMPORTANT CONTACTS")
        for c in contacts:
            parts.append(
                f"{c.name} – {c.designation}\n"
                f"Email: {c.college_email}, Phone: {c.phone_number}"
            )

    context = "\n\n".join(parts)

    print("🧠 FINAL CONTEXT SENT TO AI:")
    print(context[:1500])

    return context
