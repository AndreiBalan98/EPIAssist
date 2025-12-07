def rescrie_md(nume_fisier):
    with open(nume_fisier, "r", encoding="utf-8") as f:
        text = f.read()

    rezultat = []
    linie_curenta = ""
    in_linie = False

    i = 0
    while i < len(text):
        c = text[i]

        if c == "@":
            if linie_curenta:
                linie_curenta = " ".join(linie_curenta.split())
                rezultat.append(linie_curenta)
                linie_curenta = ""
            in_linie = True
        else:
            if in_linie:
                linie_curenta += c

        i += 1

    # Adăugăm ultima linie dacă există
    if linie_curenta:
        linie_curenta = " ".join(linie_curenta.split())
        rezultat.append(linie_curenta)

    # Rescriem fișierul
    with open(nume_fisier, "w", encoding="utf-8") as f:
        f.write("\n".join(rezultat))


# ===== RULARE =====
fisier = input("Introdu numele fisierului .md: ")
rescrie_md(fisier)
print("Fisierul a fost rescris cu succes ✅")
