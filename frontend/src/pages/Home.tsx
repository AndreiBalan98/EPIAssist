/**
 * Main home page - viewer with floating document selector and TOC.
 * Desktop: floating elements with hover behavior
 * Mobile/Tablet: header bar with drawer navigation
 */
import { useState, useCallback } from 'react';
import { Header } from '@components/Header';
import { MobileDrawer } from '@components/MobileDrawer';
import { DocumentSelector } from '@components/DocumentSelector';
import { FloatingTOC } from '@components/FloatingTOC';
import { DocumentViewer } from '@components/DocumentViewer';
import { SkeletonLoader } from '@components/SkeletonLoader';
import { ChatInput } from '@components/ChatInput';
import { useDocuments } from '@hooks/useDocuments';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const Home = () => {
  const { documents, currentDocument, loading, error, selectDocument } = useDocuments();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [scrollToHeading, setScrollToHeading] = useState<string | null>(null);
  
  // Mobile drawer states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Callback when headings are extracted from document
  const handleHeadingsExtracted = useCallback((extractedHeadings: HeadingItem[]) => {
    setHeadings(extractedHeadings);
  }, []);

  // Handle heading click from TOC
  const handleHeadingClick = useCallback((headingId: string) => {
    setScrollToHeading(headingId);
    setTimeout(() => setScrollToHeading(null), 1000);
  }, []);

  // Handle document selection
  const handleDocumentSelect = useCallback(async (filename: string) => {
    setHeadings([]);
    setScrollToHeading(null);
    await selectDocument(filename);
  }, [selectDocument]);

  // Show error state
  if (error && !currentDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center px-4">
          <svg
            className="w-12 h-12 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header - only visible on mobile/tablet */}
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onTocClick={() => setIsTocOpen(true)}
        showTocButton={headings.length > 0}
      />

      {/* Mobile Document Selector Drawer */}
      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="left"
        title="Documente"
      >
        <DocumentSelector
          documents={documents}
          selectedDocument={currentDocument?.filename || null}
          onSelect={handleDocumentSelect}
          isMobileMode={true}
          onMobileSelect={() => setIsMenuOpen(false)}
        />
      </MobileDrawer>

      {/* Mobile TOC Drawer */}
      <MobileDrawer
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        side="right"
        title="Cuprins"
      >
        <FloatingTOC
          headings={headings}
          onHeadingClick={handleHeadingClick}
          isMobileMode={true}
          onMobileSelect={() => setIsTocOpen(false)}
        />
      </MobileDrawer>

      {/* Desktop Floating Document Selector - hidden on mobile */}
      <DocumentSelector
        documents={documents}
        selectedDocument={currentDocument?.filename || null}
        onSelect={handleDocumentSelect}
      />

      {/* Desktop Floating TOC - hidden on mobile */}
      {currentDocument && (
        <FloatingTOC
          headings={headings}
          onHeadingClick={handleHeadingClick}
        />
      )}

      {/* Main Viewer - Full Screen */}
      {loading ? (
        <SkeletonLoader />
      ) : currentDocument ? (
        <DocumentViewer
          content={currentDocument.content}
          filename={currentDocument.filename}
          onHeadingsExtracted={handleHeadingsExtracted}
          scrollToHeading={scrollToHeading}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 pt-12 lg:pt-0">
          <p className="text-gray-500">Select a document to view</p>
        </div>
      )}
      
      {/* Chat Input - responsive */}
      <ChatInput />
    </div>
  );
};