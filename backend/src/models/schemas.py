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
# Document Structure Models (for RAG system)
# =============================================================================

class SectionSummary(BaseModel):
    """
    Represents a single section in a document structure.
    Used for first-pass LLM context.
    """
    section_id: str = Field(
        ..., 
        description="Unique identifier for the section, e.g., 'DOC1_S2_SS1'"
    )
    title: str = Field(
        ..., 
        description="Section title/heading"
    )
    level: int = Field(
        ..., 
        ge=1, 
        le=6, 
        description="Heading level (1-6)"
    )
    summary: str = Field(
        ..., 
        description="Brief summary of section content"
    )
    parent_id: Optional[str] = Field(
        default=None, 
        description="Parent section ID if nested"
    )


class DocumentStructure(BaseModel):
    """
    Represents the summarized structure of a document.
    Contains hierarchical sections with summaries.
    """
    document_id: str = Field(
        ..., 
        description="Unique document identifier"
    )
    title: str = Field(
        ..., 
        description="Document title"
    )
    filename: str = Field(
        ..., 
        description="Original filename"
    )
    sections: list[SectionSummary] = Field(
        default_factory=list, 
        description="List of section summaries"
    )


class SectionContent(BaseModel):
    """
    Full content of a section (used in second pass).
    """
    section_id: str
    title: str
    content: str
    document_title: str
    document_id: str


# =============================================================================
# LLM Response Models
# =============================================================================

class RelevantSectionsResponse(BaseModel):
    """
    Response from first-pass LLM containing relevant section IDs.
    """
    section_ids: list[str] = Field(
        default_factory=list, 
        description="List of relevant section IDs"
    )
    reasoning: Optional[str] = Field(
        default=None, 
        description="Brief explanation of selection (optional)"
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


class ChatResponseWithMetadata(BaseModel):
    """
    Extended chat response with source metadata.
    For future use when we want to show sources in UI.
    """
    response: str
    sources: list[str] = Field(
        default_factory=list, 
        description="List of source section IDs used"
    )
    processing_time_ms: Optional[int] = Field(
        default=None, 
        description="Total processing time in milliseconds"
    )