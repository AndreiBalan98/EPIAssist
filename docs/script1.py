def main():
    input_file = "ORDIN Nr. 1101.2016.txt"
    output_file = "ORDIN Nr. 1101.2016 - script1.txt"

    first_at_found = False
    current_line = []  # colectăm caracterele liniei curente

    with open(input_file, "r", encoding="utf-8") as fin, \
         open(output_file, "w", encoding="utf-8") as fout:

        text = fin.read()

        for ch in text:

            # Dacă întâlnim @
            if ch == "@":
                if first_at_found:
                    # finalizează linia curentă, dar fără spații la final
                    line = ''.join(current_line).rstrip()
                    fout.write(line + "\n")
                    current_line = []
                else:
                    first_at_found = True

                # nu copiem '@'
                continue

            # Ignorăm newline din fișier
            if ch == "\n":
                continue

            # caracter normal -> îl adăugăm în buffer
            current_line.append(ch)

        # Dacă s-a terminat fișierul și mai avem text în linia curentă:
        if current_line:
            line = ''.join(current_line).rstrip()
            fout.write(line)

    print("Gata! Transformarea a fost făcută în:", output_file)


if __name__ == "__main__":
    main()
