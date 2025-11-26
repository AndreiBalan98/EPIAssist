"""Business logic for chat operations."""
import httpx
from ..config.settings import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatService:
    """Handle OpenRouter API communication."""
    
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        logger.info(f"Chat service initialized with model: {self.model}")
    
    async def send_message(self, message: str) -> str:
        """
        Send message to OpenRouter and get response.
        
        Args:
            message: User message to send
        
        Returns:
            AI response text
        
        Raises:
            Exception: If API call fails
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "EPI Assist",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": message
                            }
                        ]
                    }
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract response text
                ai_response = data["choices"][0]["message"]["content"]
                logger.info(f"OpenRouter response received ({len(ai_response)} chars)")
                
                return ai_response
        
        except httpx.HTTPError as e:
            logger.error(f"OpenRouter API error: {str(e)}")
            raise Exception(f"Failed to get AI response: {str(e)}")
        
        except Exception as e:
            logger.error(f"Unexpected error in chat service: {str(e)}")
            raise


# Singleton instance
chat_service = ChatService()