/**
 * Floating Table of Contents - right side, low opacity, expands on hover.
 */
import { useState} from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  const handleHeadingClick = (id: string) => {
    setActiveHeading(id);
    onHeadingClick(id);
    setIsOpen(false);
  };

  // Don't render if no headings
  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop: hover behavior */}
      <div
        className={`hidden md:block fixed top-1/2 -translate-y-1/2 right-6 z-20 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
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

      {/* Mobile: toggle button + drawer */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 right-4 z-30 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-700">Cuprins</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => handleHeadingClick(heading.id)}
                      className={`w-full text-left text-sm transition-colors rounded px-2 py-2 ${
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
          </>
        )}
      </div>
    </>
  );
};