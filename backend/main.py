from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
from typing import List, Optional
import aiofiles

# Initialize FastAPI app
app = FastAPI(
    title="EPIAssist API",
    description="Backend for EPIAssist markdown viewer",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the absolute path to the docs directory
BASE_DIR = Path(__file__).parent.parent
DOCS_DIR = BASE_DIR / "docs"

# Ensure docs directory exists
os.makedirs(DOCS_DIR, exist_ok=True)

@app.get("/api/status")
async def get_status():
    """
    Health check endpoint to verify the API is running.
    """
    return {"status": "ok", "message": "EPIAssist API is running"}

@app.get("/api/markdown-files")
async def list_markdown_files() -> List[str]:
    """
    List all markdown (.md) files in the docs directory.
    """
    try:
        files = [f for f in os.listdir(DOCS_DIR) if f.endswith('.md')]
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/markdown/{filename}")
async def get_markdown_file(filename: str):
    """
    Get the content of a specific markdown file.
    """
    file_path = DOCS_DIR / filename
    
    # Security check to prevent directory traversal
    if not file_path.resolve().parent.samefile(DOCS_DIR):
        raise HTTPException(status_code=400, detail="Invalid file path")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
            content = await f.read()
        return {"filename": filename, "content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
