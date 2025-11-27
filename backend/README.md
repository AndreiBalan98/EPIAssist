# EPI Assist - Backend

FastAPI server for markdown document serving and AI integration with OpenAI.

## Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── documents.py  # Document operations
│   │   └── chat.py       # Chat operations
│   ├── routes/           # API endpoints
│   │   └── api.py        # Route definitions
│   ├── services/         # Business logic
│   │   ├── document_service.py
│   │   └── chat_service.py
│   ├── models/           # Data models
│   │   └── schemas.py    # Pydantic models
│   ├── utils/            # Utilities
│   │   └── logger.py     # Logging setup
│   ├── config/           # Configuration
│   │   └── settings.py   # App settings
│   ├── app.py            # FastAPI app config
│   └── server.py         # Entry point
├── tests/                # Unit tests
├── requirements.txt
└── README.md
```

## 3-Layer Architecture

1. **Routes** (`routes/`): Define endpoints, validate inputs
2. **Controllers** (`controllers/`): Handle requests, call services
3. **Services** (`services/`): Business logic, data access

## API Endpoints

- `GET /api/status` - Health check
- `GET /api/documents` - List all markdown files
- `GET /api/documents/{filename}` - Get document content
- `POST /api/chat` - Send message to AI and get response

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Create `.env` file:
```env
ENV=development
LOG_LEVEL=INFO
DOCS_DIR=../docs
CORS_ORIGINS=["http://localhost:3000"]

# OpenAI Configuration - REQUIRED
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Available OpenAI models:**
- `gpt-4o` - Most capable, best for complex tasks
- `gpt-4o-mini` - Fast and affordable (recommended for development)
- `gpt-4-turbo` - Previous generation, still very capable
- `gpt-3.5-turbo` - Fastest and most affordable

## Run

```bash
# Development
uvicorn src.server:app --reload --port 8000

# Production
uvicorn src.server:app --host 0.0.0.0 --port 8000
```

## Logging

Structured JSON logging to console and file:
- `logs/app.log` - All logs
- Console - INFO and above

## Testing

```bash
pytest tests/
```

## OpenAI Integration

The chat service uses OpenAI's Chat Completions API with:
- Automatic retry logic with exponential backoff
- Rate limit handling
- Comprehensive error logging
- 30-second timeout for requests