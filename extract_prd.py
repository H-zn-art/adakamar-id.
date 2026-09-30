import fitz  # pymupdf
import sys

def extract_pdf(path):
    doc = fitz.open(path)
    full_text = []
    for i, page in enumerate(doc):
        text = page.get_text()
        full_text.append(f"=== HALAMAN {i+1} ===\n{text}")
    return "\n".join(full_text)

# PRD Utama
try:
    text1 = extract_pdf(r"C:\Users\atika\Downloads\Magang 2\PRD adakamar.id.pdf")
    with open(r"C:\Users\atika\Downloads\Magang 2\prd_text.txt", "w", encoding="utf-8") as f:
        f.write(text1)
    print(f"PRD utama: {len(text1)} karakter, {text1.count(chr(10))} baris")
except Exception as e:
    print(f"Error PRD utama: {e}")

# PRD Role & User Flow
try:
    text2 = extract_pdf(r"C:\Users\atika\Downloads\Magang 2\PRD Role & User Flow adakamar.id.pdf")
    with open(r"C:\Users\atika\Downloads\Magang 2\prd_role_text.txt", "w", encoding="utf-8") as f:
        f.write(text2)
    print(f"PRD Role: {len(text2)} karakter, {text2.count(chr(10))} baris")
except Exception as e:
    print(f"Error PRD Role: {e}")
