# EPI Assist

Medical legislation assistant for healthcare professionals - clean, modular architecture.

## Project Structure

```
/
├── backend/          # FastAPI server
├── frontend/         # React + Vite
├── docs/            # Markdown documents
├── ai/              # AI instructions
└── README.md        # This file
```

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
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

## Deployment

### Backend (Render)
- Deployed at: `https://epiassist.onrender.com`
- Auto-deploys from `main` branch
- Environment variables set in Render dashboard

### Frontend (Vercel)
- Auto-deploys from `main` branch
- Environment variable `VITE_API_URL` set via `vercel.json`
- Uses `.env.production` for production builds

### Environment Configuration

**Local Development:**
- Frontend uses `/api` proxy → `http://localhost:8000`
- Create `frontend/.env` with local settings

**Production:**
- Frontend connects directly to `https://epiassist.onrender.com/api`
- Uses `frontend/.env.production` automatically

## Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)