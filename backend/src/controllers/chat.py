"""Controllers for chat-related endpoints."""
from fastapi import HTTPException
from ..models.schemas import ChatRequest, ChatResponse
from ..services.chat_service import chat_service
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatController:
    """Handle chat requests."""
    
    async def send_message(self, request: ChatRequest) -> ChatResponse:
        """
        Process chat message.
        
        Args:
            request: Chat request with message
        
        Returns:
            ChatResponse with AI response
        
        Raises:
            HTTPException: 400 if invalid, 500 on error
        """
        if not request.message.strip():
            logger.warning("Empty message received")
            raise HTTPException(
                status_code=400, 
                detail="Message cannot be empty"
            )
        
        try:
            logger.info(f"Processing chat ({len(request.message)} chars)")
            
            response = await chat_service.send_message(request.message)
            return ChatResponse(response=response)
        
        except Exception as e:
            logger.error(f"Failed to process chat: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to get AI response"
            )


# Singleton instance
chat_controller = ChatController()