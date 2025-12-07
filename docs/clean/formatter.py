def rescrie_md(nume_fisier):
    with open(nume_fisier, "r", encoding="utf-8") as f:
        text = f.read()

    bucati = text.split("@")  # TĂIEM STRICT DUPĂ @
    rezultat = []

    for bucata in bucati:
        linie = " ".join(bucata.split())  # forțează 1 spațiu între cuvinte
        if linie:
            rezultat.append(linie)

    with open(nume_fisier, "w", encoding="utf-8") as f:
        f.write("\n".join(rezultat))


fisier = input("Introdu numele fisierului .md: ")
rescrie_md(fisier)
print("Gata ✅")
