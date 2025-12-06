# EPI Assist - Backend

FastAPI server for markdown document serving and AI chat integration.

## Structure

```
backend/
├── src/
│   ├── config/
│   │   └── settings.py       # App configuration
│   ├── controllers/
│   │   ├── chat.py           # Chat request handlers
│   │   └── documents.py      # Document request handlers
│   ├── models/
│   │   └── schemas.py        # Pydantic models
│   ├── routes/
│   │   └── api.py            # API endpoint definitions
│   ├── services/
│   │   ├── chat_service.py   # OpenAI communication
│   │   └── document_service.py
│   ├── utils/
│   │   └── logger.py         # Logging setup
│   ├── app.py                # FastAPI app config
│   └── server.py             # Entry point
├── requirements.txt
├── .env.example
└── README.md
```

## 3-Layer Architecture

1. **Routes** (`routes/`): Define endpoints, validate inputs
2. **Controllers** (`controllers/`): Handle requests, call services
3. **Services** (`services/`): Business logic, external APIs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Health check |
| GET | `/api/documents` | List all markdown files |
| GET | `/api/documents/{filename}` | Get document content |
| POST | `/api/chat` | Send message to AI |

### Chat Request

```json
POST /api/chat
{
  "message": "Your question here"
}
```

Response:
```json
{
  "response": "AI response in markdown format"
}
```

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Create `.env` file from example:
```bash
cp .env.example .env
```

Required settings:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Optional settings:
```env
ENV=development
LOG_LEVEL=INFO
CORS_ORIGINS=["http://localhost:3000"]
OPENAI_MODEL=gpt-4o-mini
```

## Run

```bash
# Development (with auto-reload)
uvicorn src.server:app --reload --port 8000

# Production
uvicorn src.server:app --host 0.0.0.0 --port 8000
```

## Document Path

By default, documents are read from `../docs/clean/` relative to backend directory.
Override with `DOCS_DIR` environment variable if needed.

## Logging

Structured logging to:
- Console: INFO and above
- File: `logs/app.log` (all levels)

## Testing

```bash
pytest tests/
```