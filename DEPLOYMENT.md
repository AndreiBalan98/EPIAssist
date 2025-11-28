# Deployment Guide

## Overview

- **Backend**: Deployed on Render at `https://epiassist.onrender.com`
- **Frontend**: Deployed on Vercel
- **Auto-deployment**: Both deploy automatically from `main` branch

## Environment Variables

### Backend (Render Dashboard)

```env
ENV=production
LOG_LEVEL=INFO
DOCS_DIR=./docs
CORS_ORIGINS=["https://your-vercel-app.vercel.app"]
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Frontend (Vercel)

Automatically configured via `vercel.json`:
```json
{
  "env": {
    "VITE_API_URL": "https://epiassist.onrender.com/api"
  }
}
```

Or set in Vercel dashboard:
- `VITE_API_URL` = `https://epiassist.onrender.com/api`

## Local Development

1. **Copy environment files:**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your OPENAI_API_KEY

# Frontend
cd frontend
cp .env.example .env
# No changes needed for local dev
```

2. **Start backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn src.server:app --reload
```

3. **Start frontend:**
```bash
cd frontend
npm run dev
```

Frontend will proxy `/api` to `http://localhost:8000`.

## How It Works

### Development Mode
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:8000`
- Vite proxy forwards `/api/*` to backend
- Uses `frontend/.env` (VITE_API_URL=/api)

### Production Mode
- Frontend deployed on Vercel
- Backend deployed on Render
- Frontend makes direct requests to `https://epiassist.onrender.com/api`
- Uses `frontend/.env.production` (VITE_API_URL=https://epiassist.onrender.com/api)

## Streaming Support

The chat feature now uses Server-Sent Events (SSE) for streaming responses:
- Endpoint: `POST /api/chat/stream`
- Format: SSE with `data: {content}\n\n`
- Both development and production support streaming

## Troubleshooting

### Frontend can't connect to backend locally
- Ensure backend is running on port 8000
- Check `frontend/.env` has `VITE_BACKEND_URL=http://localhost:8000`
- Restart Vite dev server after changing `.env`

### Production deployment issues
- Verify `vercel.json` has correct `VITE_API_URL`
- Check Render backend is deployed and accessible
- Verify CORS settings in backend `.env` include Vercel URL

### Streaming not working
- Ensure backend has `/api/chat/stream` endpoint
- Check browser console for errors
- Verify SSE is not blocked by proxy/firewall
