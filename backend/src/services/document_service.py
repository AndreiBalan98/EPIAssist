"""Business logic for document operations."""
import aiofiles
from pathlib import Path
from typing import List
from ..config.settings import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class DocumentService:
    """Handle document retrieval and processing."""
    
    def __init__(self):
        self.docs_dir = settings.docs_dir
        logger.info(f"Document service initialized with path: {self.docs_dir}")
    
    async def list_documents(self) -> List[str]:
        """
        List all markdown files in docs directory.
        
        Returns:
            List of markdown filenames
        """
        try:
            if not self.docs_dir.exists():
                logger.warning(f"Docs directory not found: {self.docs_dir}")
                return []
            
            files = [
                f.name for f in self.docs_dir.iterdir() 
                if f.is_file() and f.suffix == '.md'
            ]
            logger.info(f"Found {len(files)} markdown files")
            return sorted(files)
        
        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            raise
    
    async def get_document(self, filename: str) -> str:
        """
        Get content of a specific markdown file.
        
        Args:
            filename: Name of the markdown file
        
        Returns:
            File content as string
        
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If path traversal attempted
        """
        # Security: prevent path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            logger.warning(f"Path traversal attempt: {filename}")
            raise ValueError("Invalid filename")
        
        file_path = self.docs_dir / filename
        
        # Ensure file is within docs directory
        if not file_path.resolve().parent.samefile(self.docs_dir):
            logger.warning(f"File outside docs directory: {filename}")
            raise ValueError("Invalid file path")
        
        if not file_path.exists():
            logger.warning(f"File not found: {filename}")
            raise FileNotFoundError(f"Document not found: {filename}")
        
        try:
            async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
                content = await f.read()
            
            logger.info(f"Retrieved document: {filename} ({len(content)} chars)")
            return content
        
        except Exception as e:
            logger.error(f"Error reading document {filename}: {str(e)}")
            raise


# Singleton instance
document_service = DocumentService()