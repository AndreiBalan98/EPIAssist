"""API route definitions."""
from fastapi import APIRouter
from ..controllers.documents import documents_controller
from ..models.schemas import StatusResponse, DocumentResponse, DocumentListResponse

router = APIRouter(prefix="/api")


@router.get("/status", response_model=StatusResponse)
async def health_check() -> StatusResponse:
    """Health check endpoint."""
    return StatusResponse(
        status="ok",
        message="EPI Assist API is running"
    )


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents() -> DocumentListResponse:
    """List all available markdown documents."""
    return await documents_controller.list_documents()


@router.get("/documents/{filename}", response_model=DocumentResponse)
async def get_document(filename: str) -> DocumentResponse:
    """
    Get specific document content.
    
    Args:
        filename: Name of the markdown file
    """
    return await documents_controller.get_document(filename)