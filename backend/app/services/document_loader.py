# backend/app/services/document_loader.py

import os
import re
import fitz            # PyMuPDF
import docx

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def load_document(file_path: str) -> str:
    """
    Load unstructured documents ONLY.
    Excel is NOT handled here.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    raw_text = ""

    if ext == ".pdf":
        doc = fitz.open(file_path)
        try:
            for page in doc:
                text = page.get_text("text")
                if text:
                    raw_text += text + "\n"
        finally:
            doc.close()

    elif ext == ".docx":
        document = docx.Document(file_path)
        raw_text = "\n".join(p.text for p in document.paragraphs if p.text.strip())

    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()

    else:
        raise ValueError(f"Unsupported document type: {ext}")

    cleaned = clean_text(raw_text)
    if not cleaned:
        raise ValueError("No readable text extracted")

    return cleaned
