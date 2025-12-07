# RAG System Integration Guide

## Overview

This update implements a two-pass RAG (Retrieval-Augmented Generation) system for the EPI Assist backend.

## Files Modified

```
backend/src/
├── config/
│   └── prompts.py              # NEW: All LLM prompts
├── models/
│   └── schemas.py              # UPDATED: New models for data.json
└── services/
    ├── chat_service.py         # UPDATED: Two-pass RAG workflow
    └── document_structure_service.py  # REWRITTEN: Reads from data.json
```

## Requirements

1. **data.json file** must exist at: `docs/structured/data.json`
   
   Expected format:
   ```json
   [
     {
       "id": 1,
       "ruta": "ORDIN Nr. 1101.2016/ANEXA 1/CAPITOLUL I",
       "level": 2,
       "titlu": "CAPITOLUL I",
       "continut": "Full text content...",
       "rezumat": "Summary of the section..."
     }
   ]
   ```

2. **OpenAI API key** configured in `.env`:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```

## How It Works

### Pass 1: Section Selection
1. User sends a question
2. System builds document structure with summaries (from `rezumat` field)
3. LLM receives structure + question, returns JSON with relevant section IDs
4. Format: `{"section_ids": [1, 5, 12]}`

### Pass 2: Answer Generation
1. System extracts full content (`continut`) of selected sections
2. Each section includes its `ruta` for citation
3. LLM generates markdown response with:
   - Inline quotes: `"text citat" - Sursa`
   - Footnotes: `text*` with `*Sursa: ruta` at end

## Installation

1. Replace the 4 files in your project:
   ```bash
   cp -r backend/src/* /path/to/your/project/backend/src/
   ```

2. Ensure `data.json` exists:
   ```bash
   ls docs/structured/data.json
   ```

3. Test the endpoint:
   ```bash
   curl -X POST http://localhost:8000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Care sunt atribuțiile Comitetului director?"}'
   ```

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER QUERY                               │
│        "Care sunt atribuțiile Comitetului director?"         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PASS 1: SECTION SELECTION                   │
│                                                              │
│  Input:                                                      │
│  - Document structure with [ID], titles, summaries           │
│  - User query                                                │
│                                                              │
│  Output: {"section_ids": [5]}                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PASS 2: ANSWER GENERATION                   │
│                                                              │
│  Input:                                                      │
│  - Full content of section [5] with ruta                     │
│  - User query                                                │
│                                                              │
│  Output: Markdown with citations                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FINAL RESPONSE                           │
│                                                              │
│  ## Atribuțiile Comitetului Director                         │
│                                                              │
│  Comitetul director are următoarele atribuții principale:*   │
│                                                              │
│  - Organizează Comitetul de prevenire...                     │
│  - "aprobă planul anual de activitate" - ORDIN 1101/2016     │
│                                                              │
│  ---                                                         │
│  *ORDIN Nr. 1101.2016/ANEXA 1/CAPITOLUL II/1. Atribuțiile... │
└─────────────────────────────────────────────────────────────┘
```

## Logging

The system logs:
- Selected section IDs from Pass 1
- Context size in characters
- OpenAI token usage
- Total processing time

Check logs at: `backend/logs/app.log`