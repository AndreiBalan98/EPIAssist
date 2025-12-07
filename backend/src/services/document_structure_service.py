"""
Document Structure Service - loads and manages document sections from data.json.

Responsibilities:
1. Load document sections from data.json at initialization
2. Build hierarchical structure with summaries for Pass 1 (section selection)
3. Extract full content for selected sections in Pass 2 (answer generation)
4. Format context for LLM prompts
"""
import json
from pathlib import Path
from typing import Optional
from ..models.schemas import DocumentSection, SectionForContext
from ..config.settings import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class DocumentStructureService:
    """
    Manages document sections from data.json for the RAG system.
    
    Data structure expected in data.json:
    [
        {
            "id": 1,
            "ruta": "ORDIN Nr. 1101.2016/ANEXA 1/CAPITOLUL I",
            "level": 2,
            "titlu": "CAPITOLUL I",
            "continut": "Full text content...",
            "rezumat": "Summary of the section..."
        },
        ...
    ]
    """
    
    def __init__(self):
        """Initialize service and load data.json."""
        self._sections: dict[int, DocumentSection] = {}
        self._sections_list: list[DocumentSection] = []
        self._data_path = self._get_data_path()
        
        self._load_data()
        
        logger.info(
            f"Document structure service initialized with "
            f"{len(self._sections)} sections from {self._data_path}"
        )
    
    def _get_data_path(self) -> Path:
        """
        Get path to data.json file.
        Located in docs/structured/data.json relative to project root.
        """
        # Navigate from backend/src/services/ to project root
        project_root = Path(__file__).parent.parent.parent.parent
        data_path = project_root / "docs" / "structured" / "data.json"
        
        logger.debug(f"Data path resolved to: {data_path}")
        return data_path
    
    def _load_data(self) -> None:
        """
        Load sections from data.json file.
        Builds indexed dictionary for fast lookup by ID.
        """
        if not self._data_path.exists():
            logger.error(f"data.json not found at: {self._data_path}")
            raise FileNotFoundError(
                f"Document data file not found: {self._data_path}"
            )
        
        try:
            with open(self._data_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
            
            if not isinstance(raw_data, list):
                raise ValueError("data.json must contain a JSON array")
            
            # Parse and index sections
            for item in raw_data:
                section = DocumentSection(**item)
                self._sections[section.id] = section
                self._sections_list.append(section)
            
            logger.info(f"Loaded {len(self._sections)} sections from data.json")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse data.json: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading data.json: {e}")
            raise
    
    def get_section_by_id(self, section_id: int) -> Optional[DocumentSection]:
        """
        Get a single section by its ID.
        
        Args:
            section_id: Numeric section identifier
            
        Returns:
            DocumentSection or None if not found
        """
        return self._sections.get(section_id)
    
    def get_sections_by_ids(self, section_ids: list[int]) -> list[DocumentSection]:
        """
        Get multiple sections by their IDs.
        
        Args:
            section_ids: List of numeric section identifiers
            
        Returns:
            List of found sections (missing IDs are skipped with warning)
        """
        sections = []
        for sid in section_ids:
            section = self._sections.get(sid)
            if section:
                sections.append(section)
            else:
                logger.warning(f"Section ID {sid} not found in data")
        
        return sections
    
    def get_all_sections(self) -> list[DocumentSection]:
        """
        Get all sections.
        
        Returns:
            List of all document sections
        """
        return self._sections_list.copy()
    
    def build_structure_for_prompt(self) -> str:
        """
        Build hierarchical document structure with summaries for Pass 1.
        
        Format:
        [ID] Level X: Titlu
        Ruta: path/to/section
        Rezumat: Summary text...
        
        Returns:
            Formatted string for LLM prompt
        """
        lines = []
        current_doc = None
        
        for section in self._sections_list:
            # Extract document name from ruta (first part)
            doc_name = section.ruta.split('/')[0] if '/' in section.ruta else section.ruta
            
            # Add document separator when document changes
            if doc_name != current_doc:
                if current_doc is not None:
                    lines.append("")
                    lines.append("=" * 60)
                lines.append("")
                lines.append(f"📄 DOCUMENT: {doc_name}")
                lines.append("=" * 60)
                current_doc = doc_name
            
            # Build section entry
            indent = "  " * (section.level - 1)
            level_indicator = "#" * section.level
            
            lines.append("")
            lines.append(f"{indent}[{section.id}] {level_indicator} {section.titlu}")
            lines.append(f"{indent}    Ruta: {section.ruta}")
            lines.append(f"{indent}    Rezumat: {section.rezumat}")
        
        return "\n".join(lines)
    
    def build_context_for_answer(
        self, 
        section_ids: list[int]
    ) -> str:
        """
        Build context with full content for Pass 2 (answer generation).
        
        Each section includes its full route for citation.
        
        Args:
            section_ids: List of selected section IDs
            
        Returns:
            Formatted context string for LLM
        """
        sections = self.get_sections_by_ids(section_ids)
        
        if not sections:
            return "Nu au fost găsite secțiuni pentru ID-urile specificate."
        
        lines = []
        
        for section in sections:
            lines.append(f"### [{section.id}] {section.titlu}")
            lines.append(f"**Ruta pentru citare:** {section.ruta}")
            lines.append("")
            lines.append(section.continut)
            lines.append("")
            lines.append("---")
            lines.append("")
        
        return "\n".join(lines)
    
    def get_sections_for_context(
        self, 
        section_ids: list[int]
    ) -> list[SectionForContext]:
        """
        Get sections prepared for context injection.
        
        Args:
            section_ids: List of selected section IDs
            
        Returns:
            List of SectionForContext objects
        """
        sections = self.get_sections_by_ids(section_ids)
        
        return [
            SectionForContext(
                id=s.id,
                ruta=s.ruta,
                titlu=s.titlu,
                continut=s.continut
            )
            for s in sections
        ]
    
    def reload_data(self) -> None:
        """
        Reload data from data.json.
        Useful if the file has been updated.
        """
        logger.info("Reloading data.json...")
        self._sections.clear()
        self._sections_list.clear()
        self._load_data()
    
    @property
    def section_count(self) -> int:
        """Get total number of sections."""
        return len(self._sections)
    
    @property
    def document_names(self) -> list[str]:
        """Get list of unique document names."""
        docs = set()
        for section in self._sections_list:
            doc_name = section.ruta.split('/')[0]
            docs.add(doc_name)
        return sorted(list(docs))


# Singleton instance
document_structure_service = DocumentStructureService()