async def index_knowledge_file(db: Session, kb_file):
    text = load_document_text(kb_file.storage_path)
    chunks = chunk_text(text)

    for chunk in chunks:
        # Skip low-value chunks
        if len(chunk) < 150 or chunk.count(" ") < 20:
            continue

        embedding = await generate_embedding(chunk)

        record = KnowledgeChunk(
            knowledge_file_id=kb_file.id,
            college_id=kb_file.college_id,
            chunk_text=chunk,
            embedding=embedding,
            source_file=kb_file.file_name
        )

        db.add(record)

    kb_file.is_processed = True
    db.commit()
