"""
Document Structure Service - manages document summaries and section extraction.

This service handles:
1. Loading document structure summaries (for first LLM pass)
2. Extracting full section content by ID (for second LLM pass)
3. Formatting document context for LLM prompts

TODO: Currently uses mock data. Will be replaced with actual document processing.
"""
from typing import Optional
from ..models.schemas import (
    DocumentStructure,
    SectionSummary,
    SectionContent,
)
from ..utils.logger import setup_logger

logger = setup_logger(__name__)


class DocumentStructureService:
    """
    Manages document structures and section extraction for the RAG system.
    
    Responsibilities:
    - Provide document structure summaries for section selection
    - Extract full section content by ID
    - Format context for LLM prompts
    """
    
    def __init__(self):
        """Initialize document structure service."""
        self._document_structures: dict[str, DocumentStructure] = {}
        self._section_contents: dict[str, SectionContent] = {}
        
        # Load mock data for development
        self._load_mock_data()
        
        logger.info(
            f"Document structure service initialized with "
            f"{len(self._document_structures)} documents"
        )
    
    def _load_mock_data(self) -> None:
        """
        Load mock document structures for development/testing.
        
        TODO: Replace with actual document processing:
        - Parse markdown documents
        - Generate section summaries (possibly using LLM)
        - Store in database for persistence
        """
        # Mock Document 1: OUG 158/2005 - Concedii medicale
        doc1 = DocumentStructure(
            document_id="DOC1",
            title="OUG 158/2005 - Concedii și indemnizații de asigurări sociale de sănătate",
            filename="oug_158_2005.md",
            sections=[
                SectionSummary(
                    section_id="DOC1_S1",
                    title="Capitolul I - Dispoziții generale",
                    level=1,
                    summary="Definește scopul ordonanței, categoriile de persoane asigurate și drepturile generale la concedii medicale.",
                    parent_id=None
                ),
                SectionSummary(
                    section_id="DOC1_S1_SS1",
                    title="Art. 1 - Obiectul reglementării",
                    level=2,
                    summary="Reglementează acordarea concediilor medicale și a indemnizațiilor de asigurări sociale de sănătate.",
                    parent_id="DOC1_S1"
                ),
                SectionSummary(
                    section_id="DOC1_S1_SS2",
                    title="Art. 2 - Persoane asigurate",
                    level=2,
                    summary="Enumeră categoriile de persoane care beneficiază de asigurare: salariați, PFA, șomeri, pensionari.",
                    parent_id="DOC1_S1"
                ),
                SectionSummary(
                    section_id="DOC1_S2",
                    title="Capitolul II - Concediul medical",
                    level=1,
                    summary="Reglementează tipurile de concediu medical, durata, condițiile de acordare și documentele necesare.",
                    parent_id=None
                ),
                SectionSummary(
                    section_id="DOC1_S2_SS1",
                    title="Art. 12 - Tipuri de concediu medical",
                    level=2,
                    summary="Descrie tipurile: boală, accident, maternitate, îngrijire copil bolnav, carantină, risc maternal.",
                    parent_id="DOC1_S2"
                ),
                SectionSummary(
                    section_id="DOC1_S2_SS2",
                    title="Art. 13 - Durata concediului",
                    level=2,
                    summary="Durata maximă 183 zile/an, excepții pentru boli grave (până la 18 luni).",
                    parent_id="DOC1_S2"
                ),
                SectionSummary(
                    section_id="DOC1_S3",
                    title="Capitolul III - Indemnizații",
                    level=1,
                    summary="Calculul și plata indemnizațiilor pentru concedii medicale.",
                    parent_id=None
                ),
                SectionSummary(
                    section_id="DOC1_S3_SS1",
                    title="Art. 17 - Calculul indemnizației",
                    level=2,
                    summary="75% din media veniturilor pe ultimele 6 luni, 100% pentru urgențe/accidente de muncă.",
                    parent_id="DOC1_S3"
                ),
            ]
        )
        
        # Mock Document 2: Normele metodologice
        doc2 = DocumentStructure(
            document_id="DOC2",
            title="Norme metodologice de aplicare a OUG 158/2005",
            filename="norme_oug_158.md",
            sections=[
                SectionSummary(
                    section_id="DOC2_S1",
                    title="Capitolul I - Certificatul medical",
                    level=1,
                    summary="Procedura de eliberare, completare și vizare a certificatului de concediu medical.",
                    parent_id=None
                ),
                SectionSummary(
                    section_id="DOC2_S1_SS1",
                    title="Secțiunea 1 - Eliberarea certificatului",
                    level=2,
                    summary="Medicii abilitați, formularul tipizat, numărul de exemplare.",
                    parent_id="DOC2_S1"
                ),
                SectionSummary(
                    section_id="DOC2_S1_SS2",
                    title="Secțiunea 2 - Completarea certificatului",
                    level=2,
                    summary="Câmpuri obligatorii, coduri diagnostic, durata, semnături.",
                    parent_id="DOC2_S1"
                ),
                SectionSummary(
                    section_id="DOC2_S2",
                    title="Capitolul II - Stagiul de cotizare",
                    level=1,
                    summary="Condiții de stagiu minim, dovada contribuțiilor, excepții.",
                    parent_id=None
                ),
            ]
        )
        
        # Mock Document 3: Legea 95/2006
        doc3 = DocumentStructure(
            document_id="DOC3",
            title="Legea 95/2006 - Reforma în domeniul sănătății",
            filename="legea_95_2006.md",
            sections=[
                SectionSummary(
                    section_id="DOC3_S1",
                    title="Titlul VIII - Asigurările sociale de sănătate",
                    level=1,
                    summary="Sistemul de asigurări de sănătate, CNAS, drepturi și obligații.",
                    parent_id=None
                ),
                SectionSummary(
                    section_id="DOC3_S1_SS1",
                    title="Capitolul I - Dispoziții generale",
                    level=2,
                    summary="Principiile sistemului, persoane asigurate, contribuții.",
                    parent_id="DOC3_S1"
                ),
            ]
        )
        
        # Mock Document 4: Codul Muncii excerpts
        doc4 = DocumentStructure(
            document_id="DOC4",
            title="Codul Muncii - Prevederi relevante",
            filename="codul_muncii.md",
            sections=[
                SectionSummary(
                    section_id="DOC4_S1",
                    title="Capitolul III - Suspendarea contractului",
                    level=1,
                    summary="Cazuri de suspendare, efecte, reluarea activității.",
                    parent_id=None
                ),
                SectionSummary(
                    section_id="DOC4_S1_SS1",
                    title="Art. 50 - Suspendare de drept",
                    level=2,
                    summary="Include concediul medical, carantina, forța majoră.",
                    parent_id="DOC4_S1"
                ),
            ]
        )
        
        # Store structures
        self._document_structures = {
            doc1.document_id: doc1,
            doc2.document_id: doc2,
            doc3.document_id: doc3,
            doc4.document_id: doc4,
        }
        
        # Create mock section contents
        # TODO: These should be actual text from documents
        self._section_contents = {
            "DOC1_S2_SS2": SectionContent(
                section_id="DOC1_S2_SS2",
                title="Art. 13 - Durata concediului",
                content="""Art. 13. - (1) Durata de acordare a concediului și a indemnizației pentru incapacitate temporară de muncă este de cel mult 183 de zile în interval de un an, socotit de la prima zi de îmbolnăvire.

(2) Începând cu a 91-a zi, concediul medical se poate prelungi de către medicul specialist până la 183 de zile, cu avizul medicului expert al asigurărilor sociale.

(3) Durata de acordare a concediului medical pentru tuberculoză, SIDA, neoplazii și alte boli grave poate fi de maximum 18 luni, în funcție de evoluția bolii.""",
                document_title="OUG 158/2005",
                document_id="DOC1"
            ),
            "DOC1_S3_SS1": SectionContent(
                section_id="DOC1_S3_SS1",
                title="Art. 17 - Calculul indemnizației",
                content="""Art. 17. - (1) Cuantumul brut al indemnizației pentru incapacitate temporară de muncă se determină prin aplicarea procentului de 75% asupra mediei veniturilor lunare din ultimele 6 luni anterioare lunii pentru care se acordă concediul medical.

(2) Pentru urgențe medico-chirurgicale și accidente de muncă, indemnizația este de 100% din media veniturilor.

(3) Baza de calcul nu poate fi mai mare decât 12 salarii minime brute pe economie.""",
                document_title="OUG 158/2005",
                document_id="DOC1"
            ),
        }
        
        logger.debug(f"Loaded mock data: {len(self._document_structures)} documents")
    
    async def get_all_document_structures(self) -> list[DocumentStructure]:
        """
        Get all document structures for first-pass LLM context.
        
        Returns:
            List of all document structures with section summaries
        """
        return list(self._document_structures.values())
    
    async def get_document_structure(
        self, 
        document_id: str
    ) -> Optional[DocumentStructure]:
        """
        Get structure for a specific document.
        
        Args:
            document_id: Document identifier
            
        Returns:
            Document structure or None if not found
        """
        return self._document_structures.get(document_id)
    
    async def get_section_content(
        self, 
        section_id: str
    ) -> Optional[SectionContent]:
        """
        Get full content for a specific section.
        
        TODO: Implement actual content extraction from documents.
        Currently returns mock data or None.
        
        Args:
            section_id: Section identifier
            
        Returns:
            Section content or None if not found
        """
        # TODO: Extract actual section content from markdown documents
        # This requires:
        # 1. Mapping section_id to file location
        # 2. Parsing markdown to find section boundaries
        # 3. Extracting and returning the content
        
        return self._section_contents.get(section_id)
    
    async def get_sections_content(
        self, 
        section_ids: list[str]
    ) -> list[SectionContent]:
        """
        Get content for multiple sections.
        
        Args:
            section_ids: List of section identifiers
            
        Returns:
            List of section contents (only found sections)
        """
        contents = []
        
        for section_id in section_ids:
            content = await self.get_section_content(section_id)
            if content:
                contents.append(content)
            else:
                logger.warning(f"Section content not found: {section_id}")
        
        return contents
    
    def format_structures_for_prompt(
        self, 
        structures: list[DocumentStructure]
    ) -> str:
        """
        Format document structures for LLM first-pass prompt.
        
        Creates a hierarchical text representation with section IDs.
        
        Args:
            structures: List of document structures
            
        Returns:
            Formatted string for LLM prompt
        """
        lines = []
        
        for doc in structures:
            lines.append(f"## {doc.title}")
            lines.append(f"Document ID: {doc.document_id}")
            lines.append("")
            
            for section in doc.sections:
                indent = "  " * (section.level - 1)
                lines.append(
                    f"{indent}[{section.section_id}] {section.title}"
                )
                lines.append(f"{indent}  → {section.summary}")
                lines.append("")
            
            lines.append("---")
            lines.append("")
        
        return "\n".join(lines)
    
    def format_contents_for_prompt(
        self, 
        contents: list[SectionContent]
    ) -> str:
        """
        Format section contents for LLM second-pass prompt.
        
        Args:
            contents: List of section contents
            
        Returns:
            Formatted string for LLM prompt
        """
        if not contents:
            return "Nu au fost găsite conținuturi pentru secțiunile selectate."
        
        lines = []
        
        for content in contents:
            lines.append(f"### [{content.section_id}] {content.title}")
            lines.append(f"*Sursa: {content.document_title}*")
            lines.append("")
            lines.append(content.content)
            lines.append("")
            lines.append("---")
            lines.append("")
        
        return "\n".join(lines)


# Singleton instance
document_structure_service = DocumentStructureService()