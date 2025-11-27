/**
 * Floating Table of Contents - right side, low opacity, expands on hover.
 */
import { useState, useRef, useEffect } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface FloatingTOCProps {
  headings: HeadingItem[];
  onHeadingClick: (id: string) => void;
}

export const FloatingTOC = ({ headings, onHeadingClick }: FloatingTOCProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  const handleHeadingClick = (id: string) => {
    setActiveHeading(id);
    onHeadingClick(id);
  };

  // Don't render if no headings
  if (headings.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 right-6 z-20 transition-all duration-300 ${
        isHovered ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-[70vh] overflow-y-auto">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Cuprins
        </h2>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleHeadingClick(heading.id)}
              className={`w-full text-left text-xs transition-colors rounded px-2 py-1.5 ${
                activeHeading === heading.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ 
                paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
              }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};