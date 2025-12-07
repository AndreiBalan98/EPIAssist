"""
Chat Service - handles AI communication with two-pass RAG system.

Workflow:
1. Pass 1 (Section Selection):
   - Build document structure with summaries
   - Send to LLM with user query
   - LLM returns JSON with relevant section IDs

2. Pass 2 (Answer Generation):
   - Extract full content of selected sections
   - Send to LLM with user query
   - LLM generates markdown response with citations

LOGGING: All prompts and responses are logged to console for debugging.
"""
import httpx
import asyncio
import json
import time
from ..config.settings import settings
from ..config.prompts import (
    SECTION_SELECTION_SYSTEM_PROMPT,
    SECTION_SELECTION_USER_TEMPLATE,
    ANSWER_GENERATION_SYSTEM_PROMPT,
    ANSWER_GENERATION_USER_TEMPLATE,
    NO_SECTIONS_FOUND_RESPONSE,
)
from ..services.document_structure_service import document_structure_service
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


# =============================================================================
# Logging Helpers - Print everything to console
# =============================================================================

def log_separator(title: str, char: str = "=", length: int = 80):
    """Print a visual separator with title."""
    print(f"\n{char * length}")
    print(f"  {title}")
    print(f"{char * length}\n")


def log_prompt(label: str, content: str, max_preview: int = None):
    """Log a prompt with optional truncation for preview."""
    print(f"\n{'─' * 60}")
    print(f"📝 {label}")
    print(f"{'─' * 60}")
    
    if max_preview and len(content) > max_preview:
        print(content[:max_preview])
        print(f"\n... [TRUNCATED - {len(content)} total chars] ...")
    else:
        print(content)
    
    print(f"{'─' * 60}\n")


def log_response(label: str, content: str):
    """Log an LLM response."""
    print(f"\n{'─' * 60}")
    print(f"🤖 {label}")
    print(f"{'─' * 60}")
    print(content)
    print(f"{'─' * 60}\n")


# =============================================================================
# Chat Service
# =============================================================================

class ChatService:
    """
    Handle AI chat with document-grounded responses.
    
    Two-pass RAG:
    1. Section selection (identifies relevant document sections)
    2. Answer generation (creates markdown response with citations)
    """
    
    def __init__(self):
        """Initialize chat service with OpenAI configuration."""
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.api_url = "https://api.openai.com/v1/chat/completions"
        self.max_tokens = settings.openai_max_tokens
        self.timeout = settings.openai_timeout
        
        logger.info(
            f"Chat service initialized - Model: {self.model}, "
            f"Sections available: {document_structure_service.section_count}"
        )
    
    async def send_message(self, message: str) -> str:
        """
        Process user message through two-pass RAG pipeline.
        
        Args:
            message: User's question/prompt
            
        Returns:
            AI-generated markdown response with citations
            
        Raises:
            Exception: If processing fails
        """
        start_time = time.time()
        
        try:
            # =================================================================
            # LOG: User's original message
            # =================================================================
            log_separator("NEW CHAT REQUEST", "█")
            print(f"⏰ Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"📨 User Message ({len(message)} chars):")
            print(f"\n   \"{message}\"\n")
            
            logger.info(f"Processing message ({len(message)} chars): {message[:100]}...")
            
            # =================================================================
            # PASS 1: Section Selection
            # =================================================================
            log_separator("PASS 1: SECTION SELECTION", "=")
            
            section_ids = await self._select_relevant_sections(message)
            
            print(f"\n✅ Pass 1 Result: {len(section_ids)} sections selected")
            print(f"   Section IDs: {section_ids}\n")
            
            logger.info(f"Pass 1 complete: {len(section_ids)} sections selected: {section_ids}")
            
            # Handle case: no relevant sections found
            if not section_ids:
                logger.warning("No relevant sections found for query")
                response = NO_SECTIONS_FOUND_RESPONSE.format(user_query=message)
                log_separator("FINAL RESPONSE (No sections found)", "█")
                print(response)
                return response
            
            # =================================================================
            # PASS 2: Answer Generation
            # =================================================================
            log_separator("PASS 2: ANSWER GENERATION", "=")
            
            # Build context with full content of selected sections
            context = document_structure_service.build_context_for_answer(section_ids)
            
            print(f"📄 Context built: {len(context)} chars from {len(section_ids)} sections")
            
            logger.debug(f"Context built ({len(context)} chars) for {len(section_ids)} sections")
            
            # Generate answer
            response = await self._generate_answer(message, context)
            
            # =================================================================
            # LOG: Final Response
            # =================================================================
            elapsed_ms = int((time.time() - start_time) * 1000)
            
            log_separator("FINAL RESPONSE TO USER", "█")
            print(response)
            print(f"\n⏱️  Total processing time: {elapsed_ms}ms")
            log_separator("END OF REQUEST", "█")
            
            logger.info(f"Chat complete in {elapsed_ms}ms - Response: {len(response)} chars")
            
            return response
            
        except Exception as e:
            logger.error(f"Error in chat processing: {str(e)}", exc_info=True)
            print(f"\n❌ ERROR: {str(e)}\n")
            raise
    
    async def _select_relevant_sections(self, user_query: str) -> list[int]:
        """
        Pass 1: Use LLM to select relevant document sections.
        
        Args:
            user_query: User's question
            
        Returns:
            List of relevant section IDs (integers)
        """
        # Build document structure with summaries
        structure = document_structure_service.build_structure_for_prompt()
        
        # Build prompts
        system_prompt = SECTION_SELECTION_SYSTEM_PROMPT
        user_prompt = SECTION_SELECTION_USER_TEMPLATE.format(
            documents_structure=structure,
            user_query=user_query
        )
        
        # =================================================================
        # LOG: Pass 1 Prompts
        # =================================================================
        log_prompt(
            "PASS 1 - SYSTEM PROMPT", 
            system_prompt
        )
        
        log_prompt(
            "PASS 1 - USER PROMPT (with document structure)", 
            user_prompt,
            max_preview=3000  # Truncate for readability, structure can be long
        )
        
        logger.debug(f"Document structure built: {len(structure)} chars")
        
        # Call LLM with low temperature for consistent JSON
        try:
            response_text = await self._call_openai(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.1,  # Low for consistent JSON output
                pass_name="PASS 1"
            )
            
            # =================================================================
            # LOG: Pass 1 Response
            # =================================================================
            log_response("PASS 1 - LLM JSON RESPONSE", response_text)
            
            logger.debug(f"Pass 1 raw response: {response_text[:500]}...")
            
            # Parse JSON response
            section_ids = self._parse_section_ids(response_text)
            
            return section_ids
            
        except Exception as e:
            logger.error(f"Section selection failed: {str(e)}")
            print(f"❌ Pass 1 failed: {str(e)}")
            return []
    
    def _parse_section_ids(self, response_text: str) -> list[int]:
        """
        Parse LLM response to extract section IDs.
        
        Handles:
        - Clean JSON: {"section_ids": [1, 2, 3]}
        - JSON with extra text before/after
        - Various formatting issues
        
        Args:
            response_text: Raw LLM response
            
        Returns:
            List of section IDs (integers)
        """
        try:
            # Find JSON object in response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                logger.warning("No JSON object found in response")
                print("⚠️  No JSON object found in Pass 1 response")
                logger.debug(f"Raw response: {response_text}")
                return []
            
            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)
            
            # Extract section_ids
            if not isinstance(data, dict):
                logger.warning(f"Expected dict, got {type(data)}")
                return []
            
            section_ids = data.get('section_ids', [])
            
            if not isinstance(section_ids, list):
                logger.warning(f"section_ids is not a list: {type(section_ids)}")
                return []
            
            # Validate and convert to integers
            valid_ids = []
            for sid in section_ids:
                if isinstance(sid, int):
                    valid_ids.append(sid)
                elif isinstance(sid, str) and sid.isdigit():
                    valid_ids.append(int(sid))
                else:
                    logger.warning(f"Invalid section ID: {sid} (type: {type(sid)})")
                    print(f"⚠️  Invalid section ID skipped: {sid}")
            
            print(f"✅ Parsed {len(valid_ids)} valid section IDs: {valid_ids}")
            logger.debug(f"Parsed section IDs: {valid_ids}")
            return valid_ids
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            print(f"❌ JSON parse error: {e}")
            logger.debug(f"Raw response: {response_text}")
            return []
    
    async def _generate_answer(self, user_query: str, context: str) -> str:
        """
        Pass 2: Generate final answer with citations.
        
        Args:
            user_query: User's question
            context: Formatted context with section contents and routes
            
        Returns:
            Markdown-formatted answer with citations
        """
        # Build prompts
        system_prompt = ANSWER_GENERATION_SYSTEM_PROMPT
        user_prompt = ANSWER_GENERATION_USER_TEMPLATE.format(
            context=context,
            user_query=user_query
        )
        
        # =================================================================
        # LOG: Pass 2 Prompts
        # =================================================================
        log_prompt(
            "PASS 2 - SYSTEM PROMPT", 
            system_prompt
        )
        
        log_prompt(
            "PASS 2 - USER PROMPT (with context)", 
            user_prompt,
            max_preview=5000  # Context can be very long
        )
        
        # Call LLM with slightly higher temperature for natural language
        response = await self._call_openai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.3,
            pass_name="PASS 2"
        )
        
        # =================================================================
        # LOG: Pass 2 Response
        # =================================================================
        log_response("PASS 2 - LLM FINAL RESPONSE", response)
        
        return response
    
    async def _call_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_retries: int = 3,
        pass_name: str = "LLM"
    ) -> str:
        """
        Make a call to OpenAI API with retry logic.
        
        Args:
            system_prompt: System role prompt
            user_prompt: User message
            temperature: Sampling temperature (0.0-1.0)
            max_retries: Maximum retry attempts
            pass_name: Name for logging (e.g., "PASS 1", "PASS 2")
            
        Returns:
            API response text
            
        Raises:
            Exception: If all retries fail
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        base_delay = 1
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                    payload = {
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": self.max_tokens,
                    }
                    
                    print(f"🔄 {pass_name} - Calling OpenAI (attempt {attempt + 1}/{max_retries})...")
                    print(f"   Model: {self.model}, Temperature: {temperature}")
                    print(f"   Prompt size: {len(user_prompt)} chars")
                    
                    logger.debug(
                        f"OpenAI request (attempt {attempt + 1}/{max_retries}) - "
                        f"Prompt size: {len(user_prompt)} chars"
                    )
                    
                    response = await client.post(
                        self.api_url,
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json=payload
                    )
                    
                    response.raise_for_status()
                    data = response.json()
                    
                    # Validate response structure
                    if "choices" not in data or len(data["choices"]) == 0:
                        logger.error(f"Unexpected response format: {data}")
                        raise Exception("Invalid response format from OpenAI")
                    
                    ai_response = data["choices"][0]["message"]["content"]
                    
                    # Log token usage
                    if "usage" in data:
                        usage = data["usage"]
                        token_info = (
                            f"   Tokens - Prompt: {usage.get('prompt_tokens', '?')}, "
                            f"Completion: {usage.get('completion_tokens', '?')}, "
                            f"Total: {usage.get('total_tokens', '?')}"
                        )
                        print(f"✅ {pass_name} - OpenAI response received")
                        print(token_info)
                        logger.info(token_info)
                    
                    return ai_response
                    
            except httpx.HTTPStatusError as e:
                # ============================================================
                # DETAILED ERROR LOGGING
                # ============================================================
                error_body = "Could not read response body"
                try:
                    error_body = e.response.text
                except:
                    pass
                
                print(f"\n{'!'*60}")
                print(f"❌ OpenAI HTTP Error: {e.response.status_code}")
                print(f"{'!'*60}")
                print(f"📋 Error Response Body:")
                print(error_body)
                print(f"{'!'*60}\n")
                
                logger.error(f"OpenAI HTTP error: {e.response.status_code}")
                logger.error(f"OpenAI error body: {error_body}")
                
                if e.response.status_code == 429:
                    # Rate limited - retry with exponential backoff
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        print(f"⚠️  Rate limited. Retrying in {delay}s...")
                        logger.warning(f"Rate limited. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Rate limit exceeded, no more retries")
                        raise Exception("Rate limit exceeded. Please try again later.")
                
                raise Exception(f"OpenAI API error: {e.response.status_code} - {error_body}")
                
            except httpx.TimeoutException:
                logger.error("OpenAI request timed out")
                print(f"⚠️  Request timed out (attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    logger.info("Retrying after timeout...")
                    continue
                raise Exception("Request timed out. Please try again.")
                
            except httpx.HTTPError as e:
                logger.error(f"HTTP error: {str(e)}")
                print(f"❌ HTTP error: {str(e)}")
                raise Exception(f"Failed to connect to OpenAI: {str(e)}")
                
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}", exc_info=True)
                print(f"❌ Unexpected error: {str(e)}")
                raise
        
        raise Exception("Failed to get response after all retries")


# Singleton instance
chat_service = ChatService()