/**
 * Left sidebar with document list and Table of Contents.
 */
import { useState } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface DocumentListProps {
  documents: string[];
  selectedDocument: string | null;
  onSelect: (filename: string) => void;
  headings: HeadingItem[];
  onHeadingClick: (id: string) => void;
}

export const DocumentList = ({ 
  documents, 
  selectedDocument, 
  onSelect,
  headings,
  onHeadingClick
}: DocumentListProps) => {
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  const handleHeadingClick = (id: string) => {
    setActiveHeading(id);
    onHeadingClick(id);
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Documents section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Documente
        </h2>
        <div className="space-y-1">
          {documents.map((doc) => (
            <button
              key={doc}
              onClick={() => onSelect(doc)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedDocument === doc
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {doc.replace('.md', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Contents section */}
      {selectedDocument && headings.length > 0 && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Cuprins
          </h2>
          <nav className="space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => handleHeadingClick(heading.id)}
                className={`w-full text-left text-sm transition-colors rounded px-2 py-1.5 ${
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
      )}
    </div>
  );
};