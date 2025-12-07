"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional


# =============================================================================
# Status Models
# =============================================================================

class StatusResponse(BaseModel):
    """Health check response."""
    status: str
    message: str


# =============================================================================
# Document Models
# =============================================================================

class DocumentResponse(BaseModel):
    """Single document response."""
    filename: str
    content: str


class DocumentListResponse(BaseModel):
    """List of documents response."""
    documents: list[str]


# =============================================================================
# Document Section Models (from data.json)
# =============================================================================

class DocumentSection(BaseModel):
    """
    Represents a single section from data.json.
    Maps directly to the JSON structure.
    """
    id: int = Field(..., description="Unique numeric identifier")
    ruta: str = Field(..., description="Hierarchical path: filename/header1/header2/...")
    level: int = Field(..., ge=1, le=6, description="Heading level (1-6)")
    titlu: str = Field(..., description="Section title/heading")
    continut: str = Field(..., description="Section content (until next heading)")
    rezumat: str = Field(..., description="AI-generated summary of the section")


class SectionForContext(BaseModel):
    """
    Section prepared for LLM context (Pass 2).
    Contains full content with route for citation.
    """
    id: int
    ruta: str
    titlu: str
    continut: str


# =============================================================================
# LLM Response Models
# =============================================================================

class SectionSelectionResponse(BaseModel):
    """
    Response from Pass 1 LLM - selected section IDs.
    """
    section_ids: list[int] = Field(
        default_factory=list,
        description="List of relevant section IDs (numeric)"
    )


# =============================================================================
# Chat Models
# =============================================================================

class ChatRequest(BaseModel):
    """Chat message request - simple prompt only."""
    message: str


class ChatResponse(BaseModel):
    """Chat message response."""
    response: str