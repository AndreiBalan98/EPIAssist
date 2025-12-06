"""
Business logic for chat operations - handles AI communication with RAG.

This service implements a two-pass Retrieval-Augmented Generation (RAG) system:

Pass 1 - Section Selection:
    - Send document structures/summaries to LLM
    - LLM returns relevant section IDs as JSON
    
Pass 2 - Answer Generation:
    - Extract full content of relevant sections
    - Send content + user query to LLM
    - LLM generates final answer with citations

This approach ensures responses are grounded in actual document content
and include proper source references.
"""
import httpx
import asyncio
import json
import time
from typing import Optional
from ..config.settings import settings
from ..config.prompts import (
    SECTION_SELECTION_SYSTEM_PROMPT,
    SECTION_SELECTION_USER_TEMPLATE,
    ANSWER_GENERATION_SYSTEM_PROMPT,
    ANSWER_GENERATION_USER_TEMPLATE,
    NO_CONTEXT_RESPONSE_TEMPLATE,
    SIMPLE_CHAT_SYSTEM_PROMPT,
)
from ..models.schemas import RelevantSectionsResponse, SectionContent
from ..services.document_structure_service import document_structure_service
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatService:
    """
    Handle AI chat with document-grounded responses.
    
    Implements two-pass RAG:
    1. Section selection (identifies relevant document sections)
    2. Answer generation (creates response with citations)
    """
    
    def __init__(self):
        """Initialize chat service with OpenAI configuration."""
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.api_url = "https://api.openai.com/v1/chat/completions"
        self.max_tokens = settings.openai_max_tokens
        self.timeout = settings.openai_timeout
        
        logger.info(f"Chat service initialized with model: {self.model}")
    
    async def send_message(self, message: str) -> str:
        """
        Process user message through RAG pipeline.
        
        This is the main entry point that orchestrates the two-pass system.
        
        Args:
            message: User's question/prompt
            
        Returns:
            AI-generated response with citations
            
        Raises:
            Exception: If processing fails
        """
        start_time = time.time()
        
        try:
            logger.info(f"Processing chat message ({len(message)} chars)")
            
            # =========================================================
            # Pass 1: Section Selection
            # =========================================================
            logger.info("Starting Pass 1: Section Selection")
            
            relevant_section_ids = await self._select_relevant_sections(message)
            
            logger.info(
                f"Pass 1 complete: {len(relevant_section_ids)} sections selected"
            )
            
            # Handle case where no relevant sections found
            if not relevant_section_ids:
                logger.warning("No relevant sections found for query")
                return NO_CONTEXT_RESPONSE_TEMPLATE.format(user_query=message)
            
            # =========================================================
            # Extract Section Contents
            # =========================================================
            # TODO: Implement actual section extraction from documents
            # Currently uses mock data from document_structure_service
            
            logger.info(f"Extracting content for sections: {relevant_section_ids}")
            
            section_contents = await document_structure_service.get_sections_content(
                relevant_section_ids
            )
            
            if not section_contents:
                logger.warning("Could not extract content for any selected section")
                return NO_CONTEXT_RESPONSE_TEMPLATE.format(user_query=message)
            
            logger.info(f"Extracted {len(section_contents)} section contents")
            
            # =========================================================
            # Pass 2: Answer Generation
            # =========================================================
            logger.info("Starting Pass 2: Answer Generation")
            
            response = await self._generate_answer(message, section_contents)
            
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info(
                f"Chat processing complete in {elapsed_ms}ms"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in chat processing: {str(e)}")
            raise
    
    async def _select_relevant_sections(
        self, 
        user_query: str
    ) -> list[str]:
        """
        Pass 1: Use LLM to select relevant document sections.
        
        Args:
            user_query: User's question
            
        Returns:
            List of relevant section IDs
        """
        # Get all document structures
        structures = await document_structure_service.get_all_document_structures()
        
        if not structures:
            logger.warning("No document structures available")
            return []
        
        # Format structures for prompt
        structures_text = document_structure_service.format_structures_for_prompt(
            structures
        )
        
        # Build user prompt
        user_prompt = SECTION_SELECTION_USER_TEMPLATE.format(
            documents_structure=structures_text,
            user_query=user_query
        )
        
        # Call LLM for section selection
        try:
            response_text = await self._call_openai(
                system_prompt=SECTION_SELECTION_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.1,  # Low temperature for consistent JSON output
            )
            
            # Parse JSON response
            section_ids = self._parse_section_selection_response(response_text)
            return section_ids
            
        except Exception as e:
            logger.error(f"Section selection failed: {str(e)}")
            # Return empty list on failure - will trigger no-context response
            return []
    
    def _parse_section_selection_response(
        self, 
        response_text: str
    ) -> list[str]:
        """
        Parse LLM response to extract section IDs.
        
        Handles various JSON formats and edge cases.
        
        Args:
            response_text: Raw LLM response
            
        Returns:
            List of section IDs
        """
        try:
            # Try to find JSON in response
            # Sometimes LLM adds text before/after JSON
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                logger.warning("No JSON found in section selection response")
                return []
            
            json_str = response_text[json_start:json_end]
            data = json.loads(json_str)
            
            # Validate and extract section_ids
            if isinstance(data, dict):
                section_ids = data.get('section_ids', [])
                
                # Validate it's a list of strings
                if isinstance(section_ids, list):
                    # Filter to only valid strings
                    valid_ids = [
                        sid for sid in section_ids 
                        if isinstance(sid, str) and sid.strip()
                    ]
                    
                    logger.debug(f"Parsed section IDs: {valid_ids}")
                    return valid_ids
            
            logger.warning(f"Unexpected JSON structure: {data}")
            return []
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            logger.debug(f"Raw response: {response_text}")
            return []
    
    async def _generate_answer(
        self, 
        user_query: str, 
        section_contents: list[SectionContent]
    ) -> str:
        """
        Pass 2: Generate final answer using extracted section contents.
        
        Args:
            user_query: User's question
            section_contents: Relevant section contents
            
        Returns:
            Generated answer with citations
        """
        # Format context from sections
        context = document_structure_service.format_contents_for_prompt(
            section_contents
        )
        
        # Build user prompt
        user_prompt = ANSWER_GENERATION_USER_TEMPLATE.format(
            context=context,
            user_query=user_query
        )
        
        # Call LLM for answer generation
        response = await self._call_openai(
            system_prompt=ANSWER_GENERATION_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.3,  # Slightly higher for natural language
        )
        
        return response
    
    async def _call_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_retries: int = 3,
    ) -> str:
        """
        Make a call to OpenAI API with retry logic.
        
        Args:
            system_prompt: System role prompt
            user_prompt: User message
            temperature: Sampling temperature
            max_retries: Maximum retry attempts
            
        Returns:
            API response text
            
        Raises:
            Exception: If all retries fail
        """
        base_delay = 1
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                    payload = {
                        "model": self.model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": self.max_tokens,
                    }
                    
                    logger.debug(
                        f"OpenAI request (attempt {attempt + 1}/{max_retries})"
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
                    
                    if "choices" not in data or len(data["choices"]) == 0:
                        logger.error(f"Unexpected response format: {data}")
                        raise Exception("Invalid response format from OpenAI")
                    
                    ai_response = data["choices"][0]["message"]["content"]
                    logger.debug(f"OpenAI response ({len(ai_response)} chars)")
                    
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
    
    async def send_simple_message(self, message: str) -> str:
        """
        Send a simple message without RAG (legacy/fallback method).
        
        Use this for queries that don't need document context.
        
        Args:
            message: User message
            
        Returns:
            AI response
        """
        return await self._call_openai(
            system_prompt=SIMPLE_CHAT_SYSTEM_PROMPT,
            user_prompt=message,
            temperature=0.3,
        )


# Singleton instance
chat_service = ChatService()