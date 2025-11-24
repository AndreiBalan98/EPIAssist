# EPIAssist Backend

This is the backend service for the EPIAssist application, built with FastAPI. It provides API endpoints for managing and serving markdown files.

## Features

- List all markdown files in the docs directory
- Get content of a specific markdown file
- Health check endpoint
- CORS enabled for development

## Setup

1. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # On Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `docs` directory in the project root (if it doesn't exist)

## Running the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /api/status` - Health check
- `GET /api/markdown-files` - List all markdown files
- `GET /api/markdown/{filename}` - Get content of a specific markdown file

## Development

- The server will automatically reload when you make changes to the code.
- API documentation is available at `http://localhost:8000/docs` when the server is running.
