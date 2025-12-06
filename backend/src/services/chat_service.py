"""Business logic for chat operations - handles AI communication."""
import httpx
import asyncio
from ..config.settings import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

# System prompt - professional medical assistant
SYSTEM_PROMPT = """Ești un asistent medical profesional pentru legislație și documente medicale din România.

STIL DE COMUNICARE:
- Răspunde în limba română, într-un ton elegant, profesionist dar prietenos
- Fii natural și fluid în comunicare
- Oferă răspunsuri clare, bine structurate și ușor de înțeles
- Răspunde cu încredere și autoritate

FORMAT RĂSPUNS:
- Folosește Markdown pentru formatare (headings, liste, bold, italic)
- Structurează răspunsurile cu titluri și liste când e relevant
- Fii concis dar complet

ROL: Asistent medical inteligent pentru personal medical - eficient, precis, accesibil."""


class ChatService:
    """Handle OpenAI API communication."""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.api_url = "https://api.openai.com/v1/chat/completions"
        logger.info(f"Chat service initialized with model: {self.model}")
    
    async def send_message(self, message: str) -> str:
        """
        Send message to OpenAI and return response.
        
        Args:
            message: User message/prompt
        
        Returns:
            AI response text
        
        Raises:
            Exception: If API call fails after retries
        """
        max_retries = 3
        base_delay = 1
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    payload = {
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.3,
                    }
                    
                    logger.info(
                        f"Sending request to OpenAI "
                        f"(attempt {attempt + 1}/{max_retries})"
                    )
                    
                    response = await client.post(
                        self.api_url,
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json=payload
                    )
                    
                    logger.info(f"OpenAI response status: {response.status_code}")
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    if "choices" not in data or len(data["choices"]) == 0:
                        logger.error(f"Unexpected response format: {data}")
                        raise Exception("Invalid response format from OpenAI")
                    
                    ai_response = data["choices"][0]["message"]["content"]
                    logger.info(f"Response received ({len(ai_response)} chars)")
                    
                    return ai_response
            
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.warning(f"Rate limited. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Rate limit exceeded, no more retries")
                        raise Exception("Rate limit exceeded. Please try again.")
                
                logger.error(f"OpenAI HTTP error: {e.response.status_code}")
                raise Exception(f"OpenAI API error: {e.response.status_code}")
            
            except httpx.HTTPError as e:
                logger.error(f"HTTP error: {str(e)}")
                raise Exception(f"Failed to connect to OpenAI: {str(e)}")
            
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                raise
        
        raise Exception("Failed to get response after all retries")


# Singleton instance
chat_service = ChatService()