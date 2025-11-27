/**
 * Utility functions for extracting document context.
 */

export interface DocumentContext {
  path: string[];  // ['Document.md', 'Section', 'Subsection']
  content: string; // Actual text content (max 5000 chars)
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extract context from markdown content based on current scroll position or clicked heading.
 * 
 * @param markdownContent - Full markdown document content
 * @param documentName - Name of the current document
 * @param headings - All extracted headings from document
 * @param activeHeadingId - Currently active/clicked heading ID
 * @returns Document context with path and relevant content
 */
export function extractDocumentContext(
  markdownContent: string,
  documentName: string,
  headings: HeadingItem[],
  activeHeadingId: string | null
): DocumentContext | null {
  if (!markdownContent || !documentName) {
    return null;
  }

  // If no active heading, return just document name and full content (truncated)
  if (!activeHeadingId || headings.length === 0) {
    return {
      path: [documentName],
      content: truncateContent(markdownContent, 5000)
    };
  }

  // Find the active heading
  const activeIndex = headings.findIndex(h => h.id === activeHeadingId);
  if (activeIndex === -1) {
    return {
      path: [documentName],
      content: truncateContent(markdownContent, 5000)
    };
  }

  const activeHeading = headings[activeIndex];

  // Build hierarchical path
  const path = buildHeadingPath(headings, activeIndex);
  path.unshift(documentName); // Add document name at start

  // Extract content for this section
  const sectionContent = extractSectionContent(
    markdownContent,
    headings,
    activeIndex
  );

  return {
    path,
    content: truncateContent(sectionContent, 5000)
  };
}

/**
 * Build hierarchical path for a heading (e.g., ['H1', 'H2', 'H3']).
 */
function buildHeadingPath(headings: HeadingItem[], targetIndex: number): string[] {
  const path: string[] = [];
  const targetLevel = headings[targetIndex].level;

  // Add the target heading
  path.push(headings[targetIndex].text);

  // Walk backwards to find parent headings
  for (let i = targetIndex - 1; i >= 0; i--) {
    const heading = headings[i];
    
    // Only add if it's a parent (lower level number = higher hierarchy)
    if (heading.level < targetLevel) {
      path.unshift(heading.text);
      
      // If we reached H1, stop
      if (heading.level === 1) {
        break;
      }
    }
  }

  return path;
}

/**
 * Extract content for a specific section (from heading to next same-level heading).
 */
function extractSectionContent(
  markdownContent: string,
  headings: HeadingItem[],
  headingIndex: number
): string {
  const lines = markdownContent.split('\n');
  const currentHeading = headings[headingIndex];
  
  // Find start line (the heading itself)
  const headingPattern = new RegExp(
    `^#{${currentHeading.level}}\\s+${escapeRegex(currentHeading.text)}\\s*$`
  );
  
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingPattern.test(lines[i])) {
      startLine = i;
      break;
    }
  }

  if (startLine === -1) {
    return markdownContent; // Fallback to full content
  }

  // Find end line (next heading of same or higher level)
  let endLine = lines.length;
  for (let i = headingIndex + 1; i < headings.length; i++) {
    if (headings[i].level <= currentHeading.level) {
      // Find this heading in lines
      const nextPattern = new RegExp(
        `^#{${headings[i].level}}\\s+${escapeRegex(headings[i].text)}\\s*$`
      );
      for (let j = startLine + 1; j < lines.length; j++) {
        if (nextPattern.test(lines[j])) {
          endLine = j;
          break;
        }
      }
      break;
    }
  }

  return lines.slice(startLine, endLine).join('\n').trim();
}

/**
 * Truncate content to specified character limit.
 */
function truncateContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) {
    return content;
  }

  // Truncate at word boundary
  const truncated = content.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxChars * 0.8) { // Only use word boundary if close to limit
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Escape special regex characters.
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}