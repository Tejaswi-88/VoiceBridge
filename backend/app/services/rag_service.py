from sqlalchemy.orm import Session

from app.services.vector_store import search_similar_chunks
from app.services.context_builder import build_context_prompt
from app.services.ai_client import generate_ai_response
from app.services.language_service import detect_language
from app.services.tone_service import build_tone_prompt

from app.services.faq_retriever import get_relevant_faqs
from app.services.contact_retriever import get_relevant_contacts

import re


META_TRIGGERS = [
    "what information",
    "what do you have",
    "tell me about",
    "overview",
    "details available",
]

ENTITY_KEYWORDS = [
    "hostel", "fee", "fees",
    "placement", "officer",
    "warden", "contact",
    "admission", "coordinator"
]


async def run_rag_pipeline(
    db: Session,
    user_query: str,
    college_id,
    role_id: int,
    memory: list | None = None
):

    q = user_query.lower()

    is_entity_query = any(k in q for k in ENTITY_KEYWORDS)
    is_meta = any(t in q for t in META_TRIGGERS) and not is_entity_query

    kb_chunks = []
    faqs = []
    contacts = []

    # ================= META =================
    if is_meta:
        kb_chunks = await search_similar_chunks(
            db,
            "college overview facilities courses hostel fees admissions contacts",
            college_id,
            top_k=8
        )
        faqs = get_relevant_faqs(db, "", college_id)
        contacts = get_relevant_contacts(db, "", college_id)

    # ================= NORMAL =================
    else:
        student_id_match = re.search(r"\b\d{2}[A-Z]{2}\d[A-Z]\d{4}\b", user_query)

        if student_id_match:
            top_k = 20
        else:
            top_k = 15 if is_entity_query else 8

        kb_chunks = await search_similar_chunks(
            db,
            user_query,
            college_id,
            top_k=top_k
        )
        faqs = get_relevant_faqs(db, user_query, college_id)
        contacts = get_relevant_contacts(db, user_query, college_id)

    print("🔎 KB chunks:", len(kb_chunks))
    print("❓ FAQs:", len(faqs))
    print("📞 Contacts:", len(contacts))

    if not kb_chunks and not faqs and not contacts:
        return {
            "reply": (
                "I could not find this information in the college knowledge base. "
                "You may try rephrasing or contact the administration."
            ),
            "confidence": 0.2,
            "sources": []
        }

    context_prompt = build_context_prompt(
        kb_chunks=kb_chunks,
        faqs=faqs,
        contacts=contacts,
    )

    system_prompt = f"""
You are VoiceBridge AI.

STRICT RULES:
- Use ONLY the information below
- Do NOT hallucinate
- If information is missing, say so clearly
- ALWAYS respond in English

Context:
{context_prompt}
"""

    messages = [{"role": "system", "content": system_prompt}]

    if memory:
        messages.extend(memory)

    messages.append({"role": "user", "content": user_query})

    reply = await generate_ai_response(messages)

    confidence = min(
        0.95,
        0.5
        + 0.05 * len(kb_chunks)
        + 0.1 * len(faqs)
        + 0.1 * len(contacts)
    )

    return {
        "reply": reply,
        "confidence": confidence,
        "sources": list(
            set(
                [c.source_file for c in kb_chunks]
                + (["FAQs"] if faqs else [])
                + (["Contacts"] if contacts else [])
            )
        ),
    }
