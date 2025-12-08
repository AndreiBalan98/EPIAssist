/**
 * Floating document selector - top-left corner, expands on hover.
 * Desktop: hover to expand (original behavior)
 * Mobile: controlled by parent via drawer
 */
import { useState, useRef, useEffect } from 'react';

interface DocumentSelectorProps {
  documents: string[];
  selectedDocument: string | null;
  onSelect: (filename: string) => void;
  // Mobile mode props
  isMobileMode?: boolean;
  onMobileSelect?: () => void; // Called after selection to close drawer
}

export const DocumentSelector = ({ 
  documents, 
  selectedDocument, 
  onSelect,
  isMobileMode = false,
  onMobileSelect
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
    if (isMobileMode) return;
    clearTimer();
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobileMode) return;
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 1000);
  };

  const handleDocumentSelect = (filename: string) => {
    onSelect(filename);
    
    if (isMobileMode) {
      // In mobile mode, notify parent to close drawer
      onMobileSelect?.();
    } else {
      // Desktop: keep expanded briefly after selection
      clearTimer();
      closeTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 500);
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  // Mobile mode: render just the list (parent handles drawer wrapper)
  if (isMobileMode) {
    return (
      <div className="p-4">
        <div className="space-y-1">
          {documents.map((doc) => (
            <button
              key={doc}
              onClick={() => handleDocumentSelect(doc)}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                selectedDocument === doc
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              {doc.replace('.md', '')}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop mode: original floating behavior (hidden on mobile via CSS)
  return (
    <div
      className="fixed top-6 left-6 z-30 hidden lg:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`transition-all duration-300 ease-out bg-white shadow-lg rounded-lg overflow-hidden ${
          isExpanded ? 'w-64' : 'w-auto'
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
          <div className="px-4 py-2 cursor-pointer flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">Documente</span>
          </div>
        )}
      </div>
    </div>
  );
};