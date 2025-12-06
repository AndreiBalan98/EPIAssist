# RAG Chat System - Implementation Notes

## Architecture Overview

The chat system uses a **two-pass Retrieval-Augmented Generation (RAG)** approach:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER QUERY                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PASS 1: SECTION SELECTION                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐  │
│  │ Document        │      │  LLM (GPT-4o)   │      │   JSON Output   │  │
│  │ Structures      │──────│  + User Query   │──────│   Section IDs   │  │
│  │ (Summaries)     │      │                 │      │   [ID1, ID2...] │  │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SECTION CONTENT EXTRACTION                           │
│  ┌─────────────────┐                           ┌─────────────────────┐  │
│  │  Section IDs    │───────────────────────────│   Full Text of      │  │
│  │  [ID1, ID2...]  │    TODO: Implement        │   Selected Sections │  │
│  └─────────────────┘                           └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PASS 2: ANSWER GENERATION                            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐  │
│  │ Section         │      │  LLM (GPT-4o)   │      │   Markdown      │  │
│  │ Contents        │──────│  + User Query   │──────│   Response      │  │
│  │ (Full Text)     │      │  + Citations    │      │   with Sources  │  │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FINAL RESPONSE                                 │
│        (Markdown formatted, with source citations)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Files Modified/Created

### New Files

1. **`src/config/prompts.py`**
   - All LLM prompts centralized
   - `SECTION_SELECTION_SYSTEM_PROMPT` - First pass system prompt
   - `SECTION_SELECTION_USER_TEMPLATE` - First pass user template
   - `ANSWER_GENERATION_SYSTEM_PROMPT` - Second pass system prompt
   - `ANSWER_GENERATION_USER_TEMPLATE` - Second pass user template
   - `NO_CONTEXT_RESPONSE_TEMPLATE` - Fallback when no sections found

2. **`src/services/document_structure_service.py`**
   - Manages document structure summaries
   - Provides section content extraction (TODO)
   - Formats data for LLM prompts

3. **`src/models/schemas.py`** (Extended)
   - `SectionSummary` - Section metadata with summary
   - `DocumentStructure` - Full document structure
   - `SectionContent` - Section with full text
   - `RelevantSectionsResponse` - First pass LLM output

### Modified Files

1. **`src/services/chat_service.py`** (Rewritten)
   - `send_message()` - Now orchestrates two-pass RAG
   - `_select_relevant_sections()` - Pass 1 implementation
   - `_generate_answer()` - Pass 2 implementation
   - `_call_openai()` - Generic OpenAI caller with retry
   - `_parse_section_selection_response()` - JSON parser

## TODO Items

The following items need implementation:

### 1. Document Structure Generation
```python
# Location: document_structure_service.py
# Currently: Mock data in _load_mock_data()
# Needed: Parse actual markdown documents and generate:
#   - Section hierarchy
#   - Section summaries (possibly via LLM)
#   - Section IDs
```

### 2. Section Content Extraction
```python
# Location: document_structure_service.py → get_section_content()
# Currently: Returns mock data
# Needed: 
#   - Map section_id to file location and line numbers
#   - Extract actual text from markdown files
#   - Handle section boundaries properly
```

### 3. Persistent Storage
```python
# Currently: In-memory storage
# Needed:
#   - Database schema for document structures
#   - Caching layer for frequently accessed sections
#   - Incremental updates when documents change
```

## Testing the System

### Quick Test
```bash
# 1. Start backend
cd backend
uvicorn src.server:app --reload

# 2. Test endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Care este durata maximă a concediului medical?"}'
```

### Expected Behavior

1. **With relevant sections found:**
   - Returns answer with `[Sursa: Document, Section]` citations
   - Markdown formatted

2. **Without relevant sections:**
   - Returns `NO_CONTEXT_RESPONSE_TEMPLATE`
   - Suggests query reformulation

## Configuration

No new environment variables required. Uses existing:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT`
- `OPENAI_MAX_TOKENS`

## Data Flow Example

**User Query:** "Cât durează concediul medical?"

**Pass 1 Response (JSON):**
```json
{
  "section_ids": ["DOC1_S2_SS2", "DOC1_S3_SS1"],
  "reasoning": "Secțiuni despre durata și calculul concediului medical"
}
```

**Pass 2 Context (formatted):**
```markdown
### [DOC1_S2_SS2] Art. 13 - Durata concediului
*Sursa: OUG 158/2005*

Art. 13. - (1) Durata de acordare a concediului...
---
```

**Final Response:**
```markdown
## Durata Concediului Medical

Conform legislației în vigoare, **durata maximă a concediului medical 
este de 183 de zile** într-un an calendaristic, calculat de la prima 
zi de îmbolnăvire [Sursa: OUG 158/2005, Art. 13].

### Excepții
Pentru boli grave (tuberculoză, cancer, SIDA), durata poate fi 
extinsă până la **18 luni** [Sursa: OUG 158/2005, Art. 13, alin. 3].
```