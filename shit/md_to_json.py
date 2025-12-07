import os
import json
import re

OUTPUT_FILE = "output.json"

header_regex = re.compile(r"^(#+)\s+(.*)")

def parse_markdown_file(filepath, global_id_start):
    results = []
    current_stack = []
    current_node = None
    current_content = []

    current_id = global_id_start
    filename = os.path.basename(filepath)
    filename_no_ext = os.path.splitext(filename)[0]  # 🔥 scoatem .md

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    def save_current_node():
        nonlocal current_node, current_content
        if current_node:
            current_node["continut"] = "\n".join(current_content).strip()
            results.append(current_node)
            current_content = []

    for line in lines:
        line = line.rstrip()

        match = header_regex.match(line)
        if match:
            # salvăm nodul anterior
            save_current_node()

            level = len(match.group(1))
            title = match.group(2).strip()

            # ajustăm ruta ierarhic
            current_stack = current_stack[:level - 1]
            current_stack.append(title)

            ruta = f"{filename_no_ext}/" + "/".join(current_stack)

            current_node = {
                "id": current_id,
                "ruta": ruta,
                "level": level,
                "titlu": title,
                "continut": "",
                "rezumat": ""
            }

            current_id += 1
        else:
            if current_node:
                current_content.append(line)

    save_current_node()
    return results, current_id


def main():
    all_results = []
    global_id = 1

    current_folder = os.getcwd()

    for filename in sorted(os.listdir(current_folder)):
        if filename.endswith(".md"):
            filepath = os.path.join(current_folder, filename)
            parsed, global_id = parse_markdown_file(filepath, global_id)
            all_results.extend(parsed)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"✅ Gata! {len(all_results)} componente salvate în {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
