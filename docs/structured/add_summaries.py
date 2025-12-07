import os
import json
from openai import OpenAI

# =========================
# CONFIG
# =========================

MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """You are a strict summarization engine.

Your only task is to compress the given content into the shortest possible summary that is still:
- fully representative of the entire section
- semantically complete
- useful for information retrieval and orientation

The summary must:
- be in romanian language
- cover all major ideas discussed
- not add any new information
- not use filler phrases
- not explain that it is a summary
- not include opinions
- not include formatting
- be as short as possible while still being comprehensive

The purpose of this summary is:
To allow a user to quickly decide whether this section contains the information they are searching for.

Return ONLY the summary text.
"""

# =========================
# OPENAI CLIENT
# =========================

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
# PROCESS COMPONENTS
# =========================

for idx, item in enumerate(data):
    content = item.get("continut", "").strip()

    if len(content) == 0:
        item["rezumat"] = ""
        continue

    if len(content) <= 100:
        item["rezumat"] = content
        print(f"✅ [{idx+1}] Rezumat copiat direct (sub 100 caractere)")
        continue

    print(f"🤖 [{idx+1}] Generez rezumat cu AI...")

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content}
        ],
        temperature=0.2
    )

    summary = response.choices[0].message.content.strip()
    item["rezumat"] = summary

# =========================
# SAVE BACK TO SAME FILE
# =========================

with open(json_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ GATA! Toate rezumatele au fost generate.")
