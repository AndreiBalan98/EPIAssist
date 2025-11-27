/**
 * Floating document selector - top-left corner, expands on hover.
 */
import { useState, useRef, useEffect } from 'react';

interface DocumentSelectorProps {
  documents: string[];
  selectedDocument: string | null;
  onSelect: (filename: string) => void;
}

export const DocumentSelector = ({ 
  documents, 
  selectedDocument, 
  onSelect 
}: DocumentSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearTimer();
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 1000);
  };

  const handleDocumentSelect = (filename: string) => {
    onSelect(filename);
    // Keep expanded briefly after selection
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 500);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      className="fixed top-6 left-6 z-30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`transition-all duration-300 ease-out bg-white shadow-lg rounded-lg overflow-hidden ${
          isExpanded ? 'w-64' : 'w-12 h-12'
        }`}
      >
        {isExpanded ? (
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Documente
            </h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <button
                  key={doc}
                  onClick={() => handleDocumentSelect(doc)}
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
        ) : (
          <div className="w-12 h-12 flex items-center justify-center cursor-pointer">
            <svg 
              className="w-6 h-6 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};