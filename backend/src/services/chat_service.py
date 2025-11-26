"""Business logic for chat operations."""
import httpx
import asyncio
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
        Send message to OpenRouter and get response with retry logic.
        
        Args:
            message: User message to send
        
        Returns:
            AI response text
        
        Raises:
            Exception: If API call fails after retries
        """
        max_retries = 3
        base_delay = 1  # seconds
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    payload = {
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": message
                            }
                        ]
                    }
                    
                    logger.info(f"Sending request to OpenRouter (attempt {attempt + 1}/{max_retries}): {self.model}")
                    
                    response = await client.post(
                        self.api_url,
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "http://localhost:3000",
                            "X-Title": "EPI Assist",
                        },
                        json=payload
                    )
                    
                    # Log response status
                    logger.info(f"OpenRouter response status: {response.status_code}")
                    
                    # Check for errors
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    # Debug log the response structure
                    logger.debug(f"Response data keys: {data.keys()}")
                    
                    # Extract response text
                    if "choices" not in data or len(data["choices"]) == 0:
                        logger.error(f"Unexpected response format: {data}")
                        raise Exception("Invalid response format from OpenRouter")
                    
                    ai_response = data["choices"][0]["message"]["content"]
                    logger.info(f"OpenRouter response received ({len(ai_response)} chars)")
                    
                    return ai_response
            
            except httpx.HTTPStatusError as e:
                # Handle rate limiting with retry
                if e.response.status_code == 429:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)  # Exponential backoff
                        logger.warning(f"Rate limited. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Rate limit exceeded, no more retries")
                        raise Exception("Rate limit exceeded. Please wait a moment and try again.")
                
                # Log full error details for other HTTP errors
                logger.error(f"OpenRouter HTTP error: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
                raise Exception(f"OpenRouter API error: {e.response.status_code} - {e.response.text}")
            
            except httpx.HTTPError as e:
                logger.error(f"OpenRouter HTTP error: {str(e)}")
                raise Exception(f"Failed to connect to OpenRouter: {str(e)}")
            
            except KeyError as e:
                logger.error(f"Failed to parse OpenRouter response: {str(e)}")
                raise Exception(f"Invalid response format: missing {str(e)}")
            
            except Exception as e:
                logger.error(f"Unexpected error in chat service: {str(e)}")
                raise
        
        # Should never reach here, but just in case
        raise Exception("Failed to get response after all retries")


# Singleton instance
chat_service = ChatService()