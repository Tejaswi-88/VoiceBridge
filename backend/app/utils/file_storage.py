import os
import hashlib
from uuid import uuid4

UPLOAD_ROOT = "storage/knowledge_files"


def generate_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def save_file(file_bytes: bytes, original_name: str, file_hash: str) -> str:
    os.makedirs(UPLOAD_ROOT, exist_ok=True)

    extension = original_name.split(".")[-1]

    filename = f"{uuid4()}_{file_hash}.{extension}"
    path = os.path.join(UPLOAD_ROOT, filename)

    with open(path, "wb") as f:
        f.write(file_bytes)

    return path
