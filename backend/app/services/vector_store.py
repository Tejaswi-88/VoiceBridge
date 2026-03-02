from sqlalchemy.orm import Session
from app.models.knowledge_chunk import KnowledgeChunk
from app.services.embedding_service import generate_embedding


async def search_similar_chunks(db: Session, query: str, college_id, top_k=6):
    query_embedding = await generate_embedding(query)

    if query_embedding is None:
        return []

    # ✅ Let Postgres + pgvector handle similarity
    results = (
        db.query(KnowledgeChunk)
        .filter(KnowledgeChunk.college_id == college_id)
        .order_by(
            KnowledgeChunk.embedding.cosine_distance(query_embedding)
        )
        .limit(top_k)
        .all()
    )

    return results
