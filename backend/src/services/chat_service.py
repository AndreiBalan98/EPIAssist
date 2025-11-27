"""Business logic for chat operations with document context."""
import httpx
import asyncio
from ..config.settings import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

# System prompt - professional medical assistant
SYSTEM_PROMPT = """Ești un asistent medical profesional pentru legislație și documente medicale din România.

REGULI STRICTE:
- Răspunde DOAR în limba română
- Fii formal, concis și la obiect
- Răspunde DOAR la întrebarea pusă, fără informații suplimentare
- Dacă ai context de document, folosește-l pentru răspunsuri precise
- Nu te lungi la explicații dacă nu este solicitat explicit
- Dacă nu știi sau informația lipsește din context, spune clar acest lucru
- Nu inventa informații - bazează-te strict pe context când este disponibil

ROL: Asistent medical pentru personal medical din spitale - eficient, precis, profesionist."""


class ChatService:
    """Handle OpenAI API communication with document context."""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.api_url = "https://api.openai.com/v1/chat/completions"
        logger.info(f"Chat service initialized with model: {self.model}")
    
    def _build_context_message(self, context: dict | None) -> str:
        """
        Build context message from document context.
        
        Args:
            context: Document context with path, heading, and content
        
        Returns:
            Formatted context string
        """
        if not context:
            return ""
        
        parts = ["CONTEXT DOCUMENT:"]
        
        # Add document path (always included)
        if context.get('path'):
            parts.append(f"\nCale: {' > '.join(context['path'])}")
        
        # Add content if under 5000 chars
        content = context.get('content', '')
        if content and len(content) <= 5000:
            parts.append(f"\nConținut:\n{content}")
        elif content:
            parts.append(f"\n(Conținut prea lung - {len(content)} caractere, limita 5000)")
        
        parts.append("\n---\n")
        return "\n".join(parts)
    
    async def send_message(
        self, 
        message: str, 
        context: dict | None = None
    ) -> str:
        """
        Send message to OpenAI with optional document context.
        
        Args:
            message: User message
            context: Optional document context with structure:
                {
                    'path': ['Document.md', 'Section', 'Subsection'],
                    'content': 'actual text content...'
                }
        
        Returns:
            AI response text
        
        Raises:
            Exception: If API call fails after retries
        """
        max_retries = 3
        base_delay = 1
        
        # Build messages with context
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add context if provided
        if context:
            context_text = self._build_context_message(context)
            if context_text:
                messages.append({
                    "role": "system", 
                    "content": context_text
                })
                logger.info(f"Added document context: {context.get('path', [])}")
        
        # Add user message
        messages.append({"role": "user", "content": message})
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    payload = {
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.3,  # More focused responses
                    }
                    
                    logger.info(
                        f"Sending request to OpenAI "
                        f"(attempt {attempt + 1}/{max_retries}): {self.model}"
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
                    logger.info(
                        f"OpenAI response received ({len(ai_response)} chars)"
                    )
                    
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
                        raise Exception(
                            "Rate limit exceeded. "
                            "Please wait a moment and try again."
                        )
                
                logger.error(f"OpenAI HTTP error: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
                raise Exception(
                    f"OpenAI API error: "
                    f"{e.response.status_code} - {e.response.text}"
                )
            
            except httpx.HTTPError as e:
                logger.error(f"OpenAI HTTP error: {str(e)}")
                raise Exception(f"Failed to connect to OpenAI: {str(e)}")
            
            except KeyError as e:
                logger.error(f"Failed to parse OpenAI response: {str(e)}")
                raise Exception(f"Invalid response format: missing {str(e)}")
            
            except Exception as e:
                logger.error(f"Unexpected error in chat service: {str(e)}")
                raise
        
        raise Exception("Failed to get response after all retries")


# Singleton instance
chat_service = ChatService()