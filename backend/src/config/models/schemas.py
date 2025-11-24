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