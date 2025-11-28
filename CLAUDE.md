# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPI Assist is a medical legislation assistant for Romanian healthcare professionals. It's a full-stack application with a FastAPI backend and React frontend that serves markdown documents and provides AI-powered chat assistance using OpenAI.

## Commands

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn src.server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Development server on port 3000
npm run build        # TypeScript + Vite build
npm run lint         # ESLint
```

### Testing
```bash
# Backend
cd backend && pytest tests/

# Frontend
cd frontend && npm run test
```

## Architecture

### Backend (FastAPI)

**3-layer architecture pattern:**
- `routes/api.py` - Endpoint definitions with Pydantic validation
- `controllers/` - Request handlers that call services
- `services/` - Business logic (document_service.py, chat_service.py)

**Key files:**
- `src/server.py` - Entry point, creates app via `create_app()`
- `src/app.py` - FastAPI configuration, CORS, router setup
- `src/config/settings.py` - Pydantic settings from `.env`

**API endpoints:**
- `GET /api/status` - Health check
- `GET /api/documents` - List markdown files
- `GET /api/documents/{filename}` - Get document content
- `POST /api/chat` - AI chat with optional document context

### Frontend (React + Vite + TypeScript)

**Path aliases defined in vite.config.ts:**
- `@/` → `src/`
- `@components` → `src/components/`
- `@services` → `src/services/`
- `@hooks` → `src/hooks/`
- `@utils` → `src/utils/`

**Key structure:**
- `pages/Home.tsx` - Main page component
- `components/` - SplashScreen, DocumentViewer, DocumentList, ChatInput, FloatingTOC
- `services/api.ts` - Axios-based API client
- `hooks/useDocuments.ts` - Document fetching hook

**Dev proxy:** Frontend proxies `/api` to the backend (configured in vite.config.ts)

### Data Flow

1. Frontend calls `api.ts` methods
2. Requests go through Vite proxy to backend `/api/*`
3. Backend routes → controllers → services
4. Chat service adds document context to OpenAI requests with Romanian system prompt

## Configuration

### Backend `.env`
```env
ENV=development
LOG_LEVEL=INFO
DOCS_DIR=../docs
CORS_ORIGINS=["http://localhost:3000"]
OPENAI_API_KEY=sk-...  # Required
OPENAI_MODEL=gpt-4o-mini
```

### Frontend `.env` (local development)
```env
VITE_BACKEND_URL=http://localhost:8000
VITE_API_URL=/api
```

### Frontend `.env.production` (Vercel deployment)
```env
VITE_API_URL=https://epiassist.onrender.com/api
```

## Key Patterns

- Backend uses singleton pattern for services (e.g., `chat_service = ChatService()`)
- Frontend uses TailwindCSS for styling
- Markdown documents stored in `/docs` directory
- Chat supports document context (path + content up to 5000 chars)
- OpenAI integration includes retry logic with exponential backoff for rate limits
