import os
import json
from collections import defaultdict

OUTPUT_TXT = "rezumat_documente.txt"

# =========================
# FIND SINGLE JSON
# =========================

json_files = [f for f in os.listdir(os.getcwd()) if f.endswith(".json")]

if len(json_files) == 0:
    raise RuntimeError("❌ EROARE: Nu există niciun fișier .json în folder.")

if len(json_files) > 1:
    raise RuntimeError("❌ EROARE: Există mai multe fișiere .json. Trebuie să fie EXACT unul singur.")

json_file = json_files[0]
print(f"✅ Folosesc fișierul: {json_file}")

# =========================
# LOAD JSON
# =========================

with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# =========================
# GROUP BY DOCUMENT
# =========================

documents = defaultdict(list)

for item in data:
    ruta = item.get("ruta", "")
    parts = ruta.split("/")
    document_name = parts[0]

    documents[document_name].append(item)

# =========================
# SORT EACH DOCUMENT BY ID
# =========================

for doc in documents:
    documents[doc].sort(key=lambda x: x["id"])

# =========================
# WRITE TXT OUTPUT
# =========================

with open(OUTPUT_TXT, "w", encoding="utf-8") as out:
    for doc_name, items in documents.items():
        out.write("=" * 30 + "\n")
        out.write(f"DOCUMENT: {doc_name}\n")
        out.write("=" * 30 + "\n\n")

        for item in items:
            level = item.get("level", 1)
            title = item.get("titlu", "")
            summary = item.get("rezumat", "")

            header = "#" * level + " " + title
            out.write(header + "\n")

            if summary:
                out.write(summary.strip() + "\n\n")
            else:
                out.write("(fără rezumat)\n\n")

print(f"\n✅ GATA! Fișierul a fost generat: {OUTPUT_TXT}")
