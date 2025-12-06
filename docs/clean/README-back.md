# EPI Assist - Backend

FastAPI server for markdown document serving and future AI integration.

## Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── documents.py  # Document operations
│   ├── routes/           # API endpoints
│   │   └── api.py        # Route definitions
│   ├── services/         # Business logic
│   │   └── document_service.py
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

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

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

## Environment Variables

Create `.env`:
```
ENV=development
LOG_LEVEL=INFO
DOCS_DIR=../docs
```

## Testing

```bash
pytest tests/
```