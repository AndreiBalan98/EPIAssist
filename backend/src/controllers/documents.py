"""Controllers for document-related endpoints."""
from fastapi import HTTPException
from ..models.schemas import DocumentResponse, DocumentListResponse
from ..services.document_service import document_service
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class DocumentsController:
    """Handle document requests."""
    
    async def list_documents(self) -> DocumentListResponse:
        """
        List all available documents.
        
        Returns:
            DocumentListResponse with list of filenames
        """
        try:
            documents = await document_service.list_documents()
            return DocumentListResponse(documents=documents)
        
        except Exception as e:
            logger.error(f"Failed to list documents: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve document list"
            )
    
    async def get_document(self, filename: str) -> DocumentResponse:
        """
        Get specific document content.
        
        Args:
            filename: Name of the document
        
        Returns:
            DocumentResponse with filename and content
        
        Raises:
            HTTPException: 404 if not found, 400 if invalid, 500 on error
        """
        try:
            content = await document_service.get_document(filename)
            return DocumentResponse(filename=filename, content=content)
        
        except FileNotFoundError:
            logger.warning(f"Document not found: {filename}")
            raise HTTPException(status_code=404, detail="Document not found")
        
        except ValueError as e:
            logger.warning(f"Invalid document request: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
        except Exception as e:
            logger.error(f"Failed to get document {filename}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve document"
            )


# Singleton instance
documents_controller = DocumentsController()