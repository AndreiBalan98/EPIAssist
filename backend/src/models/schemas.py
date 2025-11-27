"""Pydantic models for request/response validation."""
from pydantic import BaseModel


class StatusResponse(BaseModel):
    """Health check response."""
    status: str
    message: str


class DocumentResponse(BaseModel):
    """Single document response."""
    filename: str
    content: str


class DocumentListResponse(BaseModel):
    """List of documents response."""
    documents: list[str]


class DocumentContext(BaseModel):
    """Document context for chat."""
    path: list[str]  # ['Document.md', 'Section', 'Subsection']
    content: str  # Actual text content (max 5000 chars)


class ChatRequest(BaseModel):
    """Chat message request with optional context."""
    message: str
    context: DocumentContext | None = None


class ChatResponse(BaseModel):
    """Chat message response."""
    response: str