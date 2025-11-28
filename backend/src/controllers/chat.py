"""Controllers for chat-related endpoints."""
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
from ..models.schemas import ChatRequest, ChatResponse
from ..services.chat_service import chat_service
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatController:
    """Handle chat requests with document context."""
    
    async def send_message(self, request: ChatRequest) -> ChatResponse:
        """
        Process chat message with optional document context.
        
        Args:
            request: Chat request with message and optional context
        
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
            # Log context if provided
            if request.context:
                path_str = " > ".join(request.context.path)
                content_len = len(request.context.content)
                logger.info(
                    f"Processing chat with context: {path_str} "
                    f"({content_len} chars)"
                )
            else:
                logger.info(
                    f"Processing chat without context "
                    f"({len(request.message)} chars)"
                )
            
            # Convert context to dict for service
            context_dict = None
            if request.context:
                context_dict = {
                    'path': request.context.path,
                    'content': request.context.content
                }
            
            response = await chat_service.send_message(
                request.message, 
                context_dict
            )
            return ChatResponse(response=response)
        
        except Exception as e:
            logger.error(f"Failed to process chat message: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to get AI response"
            )

    async def send_message_stream(self, request: ChatRequest) -> StreamingResponse:
        """
        Process chat message and return streaming response.

        Args:
            request: Chat request with message and optional context

        Returns:
            StreamingResponse with SSE format

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
            # Log context if provided
            if request.context:
                path_str = " > ".join(request.context.path)
                content_len = len(request.context.content)
                logger.info(
                    f"Processing streaming chat with context: {path_str} "
                    f"({content_len} chars)"
                )
            else:
                logger.info(
                    f"Processing streaming chat without context "
                    f"({len(request.message)} chars)"
                )

            # Convert context to dict for service
            context_dict = None
            if request.context:
                context_dict = {
                    'path': request.context.path,
                    'content': request.context.content
                }

            async def event_generator() -> AsyncGenerator[str, None]:
                """Generate SSE events from OpenAI stream."""
                try:
                    async for chunk in chat_service.send_message_stream(
                        request.message,
                        context_dict
                    ):
                        # Send as SSE format: "data: {content}\n\n"
                        yield f"data: {chunk}\n\n"

                    # Signal completion
                    yield "data: [DONE]\n\n"

                except Exception as e:
                    logger.error(f"Error in stream: {str(e)}")
                    yield f"data: [ERROR] {str(e)}\n\n"

            return StreamingResponse(
                event_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",  # Disable nginx buffering
                }
            )

        except Exception as e:
            logger.error(f"Failed to initialize streaming: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to initialize AI stream"
            )


# Singleton instance
chat_controller = ChatController()