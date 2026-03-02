from PIL import Image
import pytesseract
import os


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from image using Tesseract OCR.
    Cleans noise and keeps only meaningful notice content.
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    try:
        img = Image.open(image_path)

        # Ensure correct mode
        if img.mode != "RGB":
            img = img.convert("RGB")

        raw_text = pytesseract.image_to_string(img)

        # ---------------- CLEANUP ----------------
        lines = []
        for line in raw_text.splitlines():
            line = line.strip()

            if not line:
                continue

            # Stop at distribution / signatures
            lower = line.lower()
            if (
                "copy to" in lower
                or "signature" in lower
                or "principal" in lower
                or "registrar" in lower
            ):
                break

            lines.append(line)

        # Limit size to avoid vector dilution
        cleaned_text = "\n".join(lines[:40])

        return cleaned_text.strip()

    except Exception as e:
        print("❌ OCR failed:", repr(e))
        return ""
