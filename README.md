# EPI Assist – Documentația proiectului și ghidul initial de implementare

Acest README descrie în detaliu modul în care proiectul **EPI Assist** este organizat, tehnologiile utilizate, fluxurile de procesare a datelor și convențiile de programare recomandate. Scopul documentului este să te ajute să ridici un **monorepo** complet funcțional pe GitHub, să înțelegi fiecare componentă și să respecți cele mai bune practici de dezvoltare.

## Descriere generală

**EPI Assist** este o aplicație desktop orientată către personalul medical. Ea oferă o interfață web elegantă pentru vizualizarea legilor, ordinelor și normativelor medicale, căutare semantică într‑un arbore de articole și interacțiune cu un chatbot inteligent. Aplicația se adresează atât medicilor cu experiență, cât și celor debutanți și are următoarele obiective:

1. **Vizualizare documente legislative** – utilizatorii pot naviga într‑un arbore ierarhic de secțiuni, subsecțiuni, articole și subpuncte. Documentele sunt prelucrate din PDF în Markdown pentru a fi importate în baza de date.
2. **Căutare semantică** – interogările sunt transformate în vectori și comparate cu embedding‑urile documentelor. Modelul selectat suportă peste o sută de limbi și lungimi mari de context[docs.ionos.com](https://docs.ionos.com/cloud/ai/ai-model-hub/models/embedding-models/bge-m3#:~:text=Summary%3A%20BGE%20m3%20is%20a,context%20understanding%20are%20crucial).
3. **Chatbot cu LLM** – un model de limbaj răspunde la întrebările utilizatorului folosind contextul relevant din documente. Răspunsurile includ referințe la secțiunile sursă.
4. **Interfață minimalistă** – aplicația folosește **React** pe front‑end și rulează ca aplicație desktop cu **Tauri** pentru a obține pachete de dimensiuni reduse și consum mic de resurse. Tauri utilizează webview‑ul nativ al sistemului de operare, ceea ce produce aplicații mai mici și mai rapide comparativ cu Electron[gethopp.app](https://www.gethopp.app/blog/tauri-vs-electron#:~:text=Instead%20of%20bundling%20the%20entire,Currently%2C%20Tauri%20uses) și poate reduce consumul de memorie de la circa 409 MB în Electron la aproximativ 172 MB într‑un benchmark simplu[gethopp.app](https://www.gethopp.app/blog/tauri-vs-electron#:~:text=Memory%20usage).

## Structura monorepozitoriului

Structura recomandată reflectă separarea clară a responsabilităților între interfața de utilizator, API‑ul backend și procesarea documentelor. Fiecare subcomponentă are propriul README cu instrucțiuni detaliate.

```
epi-assist/
├── README.md                # documentul curent cu explicații generale
├── docs/                    # documentație suplimentară, exemple de fișiere Markdown
│   └── exemple.md           # exemple de structură Markdown
├── processor/               # pipeline de prelucrare a documentelor
│   ├── requirements.txt     # dependențe Python pentru preprocesare
│   ├── import_md.py         # scriptul care parcurge fișierele Markdown și construiește arborele
│   ├── summarize.py         # modul pentru generarea de rezumate bottom‑up
│   └── embeddings.py        # modul pentru generarea de embedding‑uri
├── backend/                 # API‑ul și serviciile serverului
│   ├── app/                 # codul sursă pentru API (FastAPI/Flask)
│   │   ├── main.py          # punctul de intrare al serverului
│   │   ├── models.py        # structuri ORM/DTO
│   │   ├── routers.py       # definirea rutelor API
│   │   ├── nlp.py           # logica de sumarizare și căutare
│   │   └── vector_db.py     # integrare cu vector DB (Qdrant sau PGVector)
│   ├── requirements.txt     # dependențe backend
│   └── README.md            # instrucțiuni specifice backend‑ului
├── frontend/                # interfața React + Tauri
│   ├── src/
│   │   ├── App.tsx          # componenta principală React
│   │   ├── components/
│   │   │   ├── SplashScreen.tsx  # afișarea ecranului de pornire
│   │   │   ├── DocumentViewer.tsx # viewer pentru Markdown
│   │   │   └── ChatWidget.tsx    # widget chatbot
│   │   └── tauri.conf.json  # configurare Tauri
│   ├── package.json         # dependențe frontend
│   └── README.md            # instrucțiuni de rulare pentru front‑end
└── scripts/                 # utilitare diverse (e.g. pre‑commit, generare date de test)
    ├── setup_env.sh         # script pentru instalare rapidă a dependențelor
    └── precommit.sh         # rulează linters & formatare automată

```

### Foldere adiționale

- **`/data`** – (ignorată de versiune) destinată fișierelor PDF brute și fișierelor Markdown generate manual.
- **`/logs`** – înregistrări ale procesării și erorilor, utile pentru debugging.
- **`/tests`** – teste unitare și de integrare pentru backend și procesor.

### Exemple de fișiere

În folderul `docs/exemple.md` poți include un exemplu de document Markdown generat dintr‑un PDF. Fiecare secțiune a documentului folosește titluri Markdown (`#`, `##`, `###` etc.) astfel încât parserul să poată identifica ierarhia.

## Tehnologiile principale și argumente

### Front‑end: React + Tauri

Aplicația folosește React pentru UI și **Tauri** ca wrapper desktop. Tauri rulează codul JavaScript într‑un webview nativ (WebView2 pe Windows, WKWebView pe macOS, WebKitGTK pe Linux), reducând dimensiunea bundle‑ului și consumul de memorie[gethopp.app](https://www.gethopp.app/blog/tauri-vs-electron#:~:text=Instead%20of%20bundling%20the%20entire,Currently%2C%20Tauri%20uses). În comparație, Electron trebuie să livreze un întreg motor Chromium și Node.js, ceea ce crește mărimea aplicației și consumul de resurse[dev.to](https://dev.to/vorillaz/tauri-vs-electron-a-technical-comparison-5f37#:~:text=Bundling%3A%20The%20native%20webview%20components,bundling%20a%20full%20browser%20engine). Tauri beneficiază de un backend în **Rust**, oferind performanță și siguranță la memorie[dev.to](https://dev.to/vorillaz/tauri-vs-electron-a-technical-comparison-5f37#:~:text=Bundling%3A%20The%20native%20webview%20components,bundling%20a%20full%20browser%20engine).

### Backend: Python + Vector DB

**Python** este limbajul principal pentru procesarea documentelor și expunerea API‑ului, datorită ecosistemului bogat de biblioteci NLP. Pentru stocarea datelor se recomandă două abordări:

1. **Qdrant** – este un motor de căutare prin similaritate vectorială care oferă un API de producție pentru stocarea, căutarea și gestionarea vectorilor cu un payload[qdrant.tech](https://qdrant.tech/documentation/overview/#:~:text=Vector%20databases%20are%20a%20relatively,object%20detection%2C%20and%20many%20others). Qdrant este optimizat să stocheze și să interogheze vectori high‑dimensionali, utilizează structuri precum HNSW și suportă diferite metrici (cosinus, produs scalar, distanță Euclidiană)[qdrant.tech](https://qdrant.tech/documentation/overview/#:~:text=Vector%20databases%20are%20optimized%20for,three%20are%20fully%20supported%20Qdrant). Este o alegere bună pentru aplicații ce necesită căutare semantică la scară largă.
2. **PGVector** – o extensie PostgreSQL care oferă funcții pentru căutare vectorială și stocarea de embedding‑uri[supabase.com](https://supabase.com/docs/guides/database/extensions/pgvector#:~:text=pgvector%20is%20a%20Postgres%20extension,be%20used%20for%20storing%20embeddings). Avantajul constă în integrarea directă cu un SGBD relațional, util dacă deja folosești Postgres pentru datele structurale.

Păstrează structura ierarhică a documentelor într‑o bază de date relațională (Postgres) și vectorii de embedding într‑un vector DB. Relațiile între noduri (parentID, ID) pot fi administrate via ORM (SQLAlchemy). Vectorii pot fi încărcați în Qdrant/PGVector pentru căutări rapide.

### Modele de embedding

Căutarea semantică se bazează pe reprezentarea textelor sub formă de vectori. Selectarea modelului potrivit este crucială. Pentru limbajul român și nevoi multilingve, recomandările includ:

- **BGE m3** – un model de embedding multilingv, anunțat de Beijing Academy of Artificial Intelligence, care suportă peste 100 de limbi, un context extins de 8192 de tokeni și oferă atât căutare densă, cât și sparce[docs.ionos.com](https://docs.ionos.com/cloud/ai/ai-model-hub/models/embedding-models/bge-m3#:~:text=Summary%3A%20BGE%20m3%20is%20a,context%20understanding%20are%20crucial). Este adecvat pentru aplicații internaționale și sisteme de căutare cross‑linguale.
- **gte‑multilingual‑base** – model din familia GTE a Alibaba Group, având 305 milioane de parametri. GTE‑multilingual‑base acoperă mai mult de 70 de limbi, oferă reprezentări dense elastice și este construit pe o arhitectură encoder‑only, ceea ce îl face eficient din punct de vedere al resurselor[bentoml.com](https://www.bentoml.com/blog/a-guide-to-open-source-embedding-models#:~:text=gte). Modelul poate genera și vectori sparsi și are suport pentru output flexibil.

**EPI Assist** folosește modelul BGE m3 pentru embedding‑urile inițiale. Acesta oferă cea mai bună acoperire pentru limba română și un context generos. Pentru versiuni viitoare se pot testa GTE‑multilingual sau Qwen3‑Embedding pentru performanță sporită.

### Rezumare ierarhică

Întregul document trebuie condensat pentru a facilita navigarea și a reduce costurile de inferență. **Sumarizarea ierarhică** sau bottom‑up presupune împărțirea unui text lung în secțiuni, generarea de rezumate pentru fiecare secțiune și apoi combinarea acestor rezumate într‑un rezumat de nivel superior. Această metodă este folosită pentru a rezuma texte extrem de lungi (>100 K tokeni) prin gruparea pe niveluri și apoi combinarea rezumatelor într‑un rezumat final coerent[arxiv.org](https://arxiv.org/abs/2502.00977#:~:text=,amplify%20LLM%20hallucinations%2C%20increasing%20the). Procesul se repetă de jos în sus până se ajunge la rezumatul întregului document.

### Servicii AI – OpenRouter

Pentru generarea rezumatelor și răspunsurilor conversaționale, proiectul se integrează cu **OpenRouter**. Platforma oferă acces la sute de modele LLM printr‑un API unic. OpenRouter permite rutarea cererilor către furnizori diferiți și are un overhead de circa 15 milisecunde, oferind disponibilitate ridicată și posibilitatea de a utiliza politici de confidențialitate pentru a controla către ce modele ajung datele[openrouter.ai](https://openrouter.ai/#:~:text=One%20API%20for%20Any%20Model,Learn%20more%20%2014).

## Fluxuri de lucru și pipeline‑uri

### 1. Preprocesarea documentelor

1. **Conversie PDF → text** – folosește un utilitar precum `pdfminer.six` sau `pdftotext` pentru a extrage textul. Curățarea preliminară (în special eliminarea numerelor de pagină, anteturilor și subsolurilor) este manuală sau semi‑automată.
2. **Curățare manuală** – corectează erorile de OCR, elimină spațiile multiple, repară linii tăiate. Poți folosi un editor de text cu regex pentru a automatiza parțial acest pas.
3. **Conversie în Markdown** – păstrează structura ierarhică folosind titluri Markdown: `#` pentru titlul documentului, `##` pentru secțiuni, `###` pentru subsecțiuni, `####` pentru articole și `#####` pentru subpuncte. Un fragment tipic arată astfel:
    
    ```markdown
    # [Titlu Document]
    ## [Secțiune 1]
    ### [Subsecțiune 1.1]
    #### [Articol 1.1.1]
    ##### [Subpunct]
    Textul articolului...
    
    ```
    
    Formatul ierarhic permite parserului din `processor/import_md.py` să construiască arborele cu ușurință.
    

### 2. Import în baza de date

Scriptul `processor/import_md.py` parcurge fișierele Markdown și construiește un arbore de noduri (ID, parentID, titlu, conținut, nivel). Exemple de implementare:

```python
import markdown
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Node:
    id: int
    parent_id: Optional[int]
    title: str
    content: str
    level: int

def parse_markdown(md_path: str) -> List[Node]:
    nodes: List[Node] = []
    stack: List[Node] = []  # stiva cu nodurile părinte
    node_id = 0
    with open(md_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('#'):
                level = line.count('#')
                title = line.strip('#').strip()
                content = ''
                # determină parentID în funcție de nivel
                while stack and stack[-1].level >= level:
                    stack.pop()
                parent_id = stack[-1].id if stack else None
                node_id += 1
                node = Node(node_id, parent_id, title, content, level)
                nodes.append(node)
                stack.append(node)
            else:
                # adaugă conținutul la ultimul nod
                if nodes:
                    nodes[-1].content += line
    return nodes

# Ex. import și salvare în baza de date
def save_to_db(nodes: List[Node], session):
    for node in nodes:
        session.add(DatabaseNode(
            id=node.id,
            parent_id=node.parent_id,
            title=node.title,
            content=node.content,
            level=node.level
        ))
    session.commit()

```

### 3. Generare de rezumate

Algoritmul de rezumare ierarhică se implementează în `processor/summarize.py`:

1. **Frunze** – pentru fiecare nod frunză (articole, subpuncte), se solicită unui LLM (prin OpenRouter) un rezumat scurt (1–3 fraze).
2. **Noduri intermediare** – se combină rezumatele copiilor pentru a genera un rezumat al secțiunii. Se repetă până la nivelul rădăcină.
3. **Validare** – rezumatele sunt revizuite pentru a evita halucinațiile. Se pot stoca atât rezumatul, cât și textul complet în baza de date pentru referință ulterioară.

### 4. Generare de embedding‑uri

Scriptul `processor/embeddings.py` ia textul sau rezumatul fiecărui nod și generează un vector. Codul poate arăta astfel:

```python
from sentence_transformers import SentenceTransformer
from typing import List

# încarcă modelul BGE m3
model = SentenceTransformer('BAAI/bge-m3')

def generate_embeddings(nodes: List[Node]):
    texts = [node.content for node in nodes]
    vectors = model.encode(texts, normalize_embeddings=True)
    for node, vec in zip(nodes, vectors):
        # stochează vectorul în DB (Qdrant/PGVector)
        upsert_vector(node.id, vec)

```

Modelul BGE m3 suportă în mod nativ limbi multiple și poate produce vectori de 1024 de dimensiuni. Pentru alternative, poți încărca `gte-multilingual-base` cu HuggingFace Transformers sau un alt model similar. GTE‑multilingual oferă performanță în 70+ limbi și folosește o arhitectură encoder‑only eficientă[bentoml.com](https://www.bentoml.com/blog/a-guide-to-open-source-embedding-models#:~:text=gte).

### 5. Căutare semantică și răspuns conversational

1. **Embedding al întrebării** – la fiecare interogare a utilizatorului, transformă întrebarea într‑un vector cu același model.
2. **Interogare vectorială** – caută cei mai apropiați N vectori în Qdrant/PGVector folosind cosinus sau produs scalar[qdrant.tech](https://qdrant.tech/documentation/overview/#:~:text=Vector%20databases%20are%20optimized%20for,three%20are%20fully%20supported%20Qdrant).
3. **Recuperare context** – extrage textul complet și rezumatele pentru nodurile returnate.
4. **Generare răspuns** – trimite promptul și contextul către un LLM via OpenRouter. Promptul sistem trebuie să amintească modelului să folosească strict informația din context, să citeze nodurile și să nu inventeze articole inexistente.
5. **Afișare** – front‑end‑ul primește răspunsul și evidențiază secțiunile referințate.

## Interfața utilizator și experiența de navigare

Interfața React este minimalistă, iar Tauri îi permite să ruleze nativ pe toate sistemele de operare. Layout‑ul recomandat:

1. **Splash screen** – la pornire, se afișează ecran alb cu textul **EPI Assist**: cuvântul “EPI” în uppercase și “Assist” cu A mare și `ss` italic.
2. **Viewer documente** – stânga sus conține un cerc alb; la hover se deschide un meniu vertical cu lista documentelor importate. Utilizatorul poate extinde secțiunile și naviga. Centrul afișează conținutul Markdown. Articolele la care se ajunge din chatbot sunt evidențiate cu galben.
3. **Chatbot** – un cerc albastru plasat în partea de jos se transformă, la hover, într‑o bară de input. La trimiterea întrebării, chatul se deschide pe dreapta și afişează răspunsul. Răspunsurile includ link‑uri către articole, iar click‑ul scroll‑ează viewer‑ul la articolul respectiv.

## Convenții de programare și calitate a codului

### Python – PEP 8

Respectă recomandările PEP 8 pentru a scrie cod lizibil și uniform. Conform ghidului oficial:

- **Numele de funcții și variabile**: folosește litere mici, cu cuvintele separate prin underscore (`snake_case`)[peps.python.org](https://peps.python.org/pep-0008/#:~:text=). Doar în contexte speciale este permis `mixedCase`[peps.python.org](https://peps.python.org/pep-0008/#:~:text=mixedCase%20is%20allowed%20only%20in,py%29%2C%20to%20retain%20backwards%20compatibility).
- **Constantele**: sunt scrise cu litere mari și underscore între cuvinte (ex.: `MAX_SIZE`)[peps.python.org](https://peps.python.org/pep-0008/#:~:text=).
- **Metode de clasă și atribute**: respectă aceleași reguli; adaugă un underscore la început pentru membrii nepublici[peps.python.org](https://peps.python.org/pep-0008/#:~:text=Use%20the%20function%20naming%20rules%3A,as%20necessary%20to%20improve%20readability).

Pe lângă PEP 8, se recomandă folosirea linters automate: **Flake8** sau **Pylint** pentru Python. Include un target `lint` în `Makefile`/`pyproject.toml` și configurează un hook pre‑commit care rulează linterul și formatatorul (`black` sau `ruff`).

### JavaScript/TypeScript – Prettier & ESLint

Pentru front‑end utilizează **Prettier**, un formator de cod care suportă multe limbaje (JavaScript, TypeScript, CSS, HTML, JSON etc.) și integrează cu majoritatea editorilor[prettier.io](https://prettier.io/#:~:text=What%20is%20Prettier%3F). Prettier formatează automat codul la salvare și elimină discuțiile despre stil[prettier.io](https://prettier.io/#:~:text=What%20is%20Prettier%3F). Combină Prettier cu **ESLint** pentru verificarea regulilor de calitate (preferințe de importuri, complexitate, etc.). Poți adăuga fișiere `.prettierrc` și `.eslintrc` în rădăcină.

### Managementul dependențelor și scripturi de automatizare

- Folosește `requirements.txt` și un `virtualenv`/`poetry` pentru Python. Documentează versiunile modelelor (de ex. `sentence-transformers==2.x`).
- Pentru front‑end, `package.json` definește scripturi precum `npm run dev` (dezvoltare), `npm run build` și `npm run lint`.
- Include scripturi `setup_env.sh` pentru configurare rapidă și `precommit.sh` pentru rularea testelor și a linterelor înainte de commit.

## Configurarea și rularea proiectului

1. **Clonează repo‑ul** și instalează dependențele:
    
    ```bash
    git clone https://github.com/username/epi-assist.git
    cd epi-assist
    # configurare backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r backend/requirements.txt
    pip install -r processor/requirements.txt
    # configurare frontend
    cd frontend
    npm install
    
    ```
    
2. **Setează variabilele de mediu** – în special `OPENROUTER_API_KEY` pentru accesul la LLM‑uri și `QDRANT_URL`/`POSTGRES_DSN` pentru baza de date. Creează un fișier `.env` în `backend`.
3. **Importă documentele** – plasează fișierele Markdown în `data/markdown` și rulează:
    
    ```bash
    cd processor
    python import_md.py --source ../data/markdown --db postgres://.../epi_assist
    python summarize.py --db postgres://.../epi_assist
    python embeddings.py --db qdrant://localhost:6333
    
    ```
    
4. **Pornește serverul backend**:
    
    ```bash
    cd backend
    uvicorn app.main:app --reload
    
    ```
    
5. **Pornește interfața desktop**:
    
    ```bash
    cd frontend
    npm run tauri dev
    
    ```
    
6. Deschide aplicația și testează căutarea semantică și chatbotul. Verifică logurile pentru eventuale erori.

## Sisteme de prompt și regulile chatbotului

Un exemplu de prompt sistem pentru LLM:

```
Sistem: Ești un asistent pentru personalul medical. Ai acces la articole din normative și legi medicale. Răspunde la întrebări folosind numai conținutul din articolele furnizate. Oferă răspunsuri concise, nu inventa informații și citează referințele (ID‑urile nodurilor) din care ai extras datele.

```

Acest prompt subliniază restricțiile de hallucinație și obligă modelul să returneze referințe clare către arbore.

## Perspective viitoare

Proiectul poate fi extins în mai multe direcții:

1. **Rezumat vs. embedding** – deocamdată se folosesc embedding‑uri directe pe text pentru precizie maximă. Pentru a reduce costurile și stocarea, poți crea embedding‑uri din rezumate; totuși, aceasta poate pierde informație semantică[docs.ionos.com](https://docs.ionos.com/cloud/ai/ai-model-hub/models/embedding-models/bge-m3#:~:text=Summary%3A%20BGE%20m3%20is%20a,context%20understanding%20are%20crucial).
2. **Alte modele** – explorează modele noi precum Qwen3‑Embedding cu suport peste 100 de limbi și dimensiuni flexibile[bentoml.com](https://www.bentoml.com/blog/a-guide-to-open-source-embedding-models#:~:text=%2A%20Multilingual%20performance%3A%20Qwen3,storage%20constraints%20are%20a%20concern) sau Jina Embeddings v4 pentru documente multimodale[bentoml.com](https://www.bentoml.com/blog/a-guide-to-open-source-embedding-models#:~:text=Jina%20Embeddings%20v4).
3. **Evoluția UI** – adoptă Tauri v2, adaugă actualizări automate (updater), folosește sidecars pentru module suplimentare (de ex. procesare video)[gethopp.app](https://www.gethopp.app/blog/tauri-vs-electron#:~:text=The%20comparison%20above%20presents%20the,Tauri%20for%20these%20key%20reasons).
4. **Analiza feedback‑ului** – loghează întrebările și evaluările utilizatorilor pentru a îmbunătăți prompturile și a rafina rezumatele.
5. **Încorporare testare automată** – extinde `tests/` cu suite de teste pentru import, generare rezumate și căutare semantică.

## Contribuții

Contribuțiile sunt binevenite. Respectă convențiile de programare menționate, scrie teste pentru funcționalitățile adăugate și documentează în README‑urile componentelor. Pentru commit‑uri, urmează un format clar (`feat: …`, `fix: …`, `chore: …`) și descrie schimbările pe scurt. Deschide **pull request‑uri** pe GitHub pentru revizuire.

---

**EPI Assist** își propune să simplifice accesul la informația legislativă medicală printr‑o interfață modernă, o căutare inteligentă și o integrare strânsă a tehnologiilor AI. Documentul de față oferă o fundație solidă pentru implementarea și extinderea proiectului, respectând cele mai bune practici de inginerie software și NLP.