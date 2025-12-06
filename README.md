# EPI Assist

Medical legislation assistant for healthcare professionals - clean, modular architecture.

## Project Structure

```
/
├── backend/              # FastAPI server
├── frontend/             # React + Vite
├── docs/
│   ├── raw/              # Original PDF documents (gitignored)
│   ├── clean/            # Processed markdown files
│   └── database/         # Future: PostgreSQL structure docs
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit with your OPENAI_API_KEY
uvicorn src.server:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture Principles

- **3-layer pattern**: Routes → Controllers → Services
- **Modular structure**: Feature-based organization
- **Minimal code**: Clear, commented, English only
- **Solid logging**: Structured logging throughout
- **Type safety**: TypeScript frontend, Python type hints backend

## Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:3000`
- Frontend proxies `/api` to backend

## Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Docs README](./docs/README.md)