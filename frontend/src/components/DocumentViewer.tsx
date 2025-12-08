/**
 * Main document viewer - A4 width on desktop, full width on mobile.
 * Responsive padding and top offset for mobile header.
 */
import { useEffect, useRef, ReactNode } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';

interface DocumentViewerProps {
  content: string;
  filename: string;
  onHeadingsExtracted: (headings: Array<{ id: string; text: string; level: number }>) => void;
  scrollToHeading?: string | null;
}

export const DocumentViewer = ({ 
  content,
  onHeadingsExtracted,
  scrollToHeading 
}: DocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract headings from markdown content
  useEffect(() => {
    const headings: Array<{ id: string; text: string; level: number }> = [];
    const lines = content.split('\n');
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        
        headings.push({ id, text, level });
      }
    });

    onHeadingsExtracted(headings);
  }, [content, onHeadingsExtracted]);

  // Smooth scroll to heading when requested
  useEffect(() => {
    if (scrollToHeading && containerRef.current) {
      const element = document.getElementById(scrollToHeading);
      if (element) {
        // Scroll to element with smooth behavior and offset for better visibility
        // Mobile has header (48px) + extra padding, desktop just needs small offset
        const offset = window.innerWidth < 1024 ? 64 : 80;

        containerRef.current.scrollTo({
          top: element.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    }
  }, [scrollToHeading]);

  // Helper to generate ID from text
  const generateId = (children: ReactNode): string => {
    const text = children?.toString() || '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  // Custom components for ReactMarkdown to add IDs to headings
  const components: Components = {
    h1: ({ children, ...props }) => {
      const id = generateId(children);
      return <h1 id={id} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }) => {
      const id = generateId(children);
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const id = generateId(children);
      return <h3 id={id} {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }) => {
      const id = generateId(children);
      return <h4 id={id} {...props}>{children}</h4>;
    },
    h5: ({ children, ...props }) => {
      const id = generateId(children);
      return <h5 id={id} {...props}>{children}</h5>;
    },
    h6: ({ children, ...props }) => {
      const id = generateId(children);
      return <h6 id={id} {...props}>{children}</h6>;
    },
  };

  return (
    <div 
      ref={containerRef} 
      className="flex-1 h-screen overflow-y-auto bg-gray-50 
        pt-12 lg:pt-0 
        pb-24"
    >
      {/* 
        Responsive container:
        - Mobile: minimal padding, full width
        - Desktop: max-width A4-ish, centered with more padding
      */}
      <div className="
        mx-auto 
        px-4 py-4
        sm:px-6 sm:py-6
        lg:max-w-4xl lg:px-8 lg:py-8
      ">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="prose prose-slate max-w-none prose-sm sm:prose-base">
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};