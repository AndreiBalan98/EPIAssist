/**
 * Main home page - viewer only with floating document selector and TOC.
 */
import { useState, useCallback } from 'react';
import { DocumentSelector } from '@components/DocumentSelector';
import { FloatingTOC } from '@components/FloatingTOC';
import { DocumentViewer } from '@components/DocumentViewer';
import { SkeletonLoader } from '@components/SkeletonLoader';
import { ChatInput } from '@components/ChatInput';
import { useDocuments } from '@hooks/useDocuments';
import { extractDocumentContext } from '@utils/context';
import type { DocumentContext } from '@services/api';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const Home = () => {
  const { documents, currentDocument, loading, error, selectDocument } = useDocuments();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [scrollToHeading, setScrollToHeading] = useState<string | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Callback when headings are extracted from document
  const handleHeadingsExtracted = useCallback((extractedHeadings: HeadingItem[]) => {
    setHeadings(extractedHeadings);
  }, []);

  // Handle heading click from TOC
  const handleHeadingClick = useCallback((headingId: string) => {
    setActiveHeadingId(headingId);
    setScrollToHeading(headingId);
    // Reset after scroll to allow re-clicking same heading
    setTimeout(() => setScrollToHeading(null), 1000);
  }, []);

  // Handle document selection - reset headings and scroll
  const handleDocumentSelect = useCallback(async (filename: string) => {
    setHeadings([]);
    setScrollToHeading(null);
    setActiveHeadingId(null);
    await selectDocument(filename);
  }, [selectDocument]);

  // Build document context for chat
  const getDocumentContext = useCallback((): DocumentContext | undefined => {
    if (!currentDocument) {
      return undefined;
    }
    
    return extractDocumentContext(
      currentDocument.content,
      currentDocument.filename,
      headings,
      activeHeadingId
    ) || undefined;
  }, [currentDocument, headings, activeHeadingId]);

  // Show error state
  if (error && !currentDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
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
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Floating Document Selector - Top Left */}
      <DocumentSelector
        documents={documents}
        selectedDocument={currentDocument?.filename || null}
        onSelect={handleDocumentSelect}
      />

      {/* Floating TOC - Right Side */}
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
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Select a document to view</p>
        </div>
      )}
      
      {/* Chat Input */}
      <ChatInput getDocumentContext={getDocumentContext} />
    </div>
  );
};