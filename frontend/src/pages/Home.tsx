/**
 * Main home page component with TOC functionality.
 */
import { useState, useCallback } from 'react';
import { DocumentList } from '@components/DocumentList';
import { DocumentViewer } from '@components/DocumentViewer';
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

  // Callback when headings are extracted from document
  const handleHeadingsExtracted = useCallback((extractedHeadings: HeadingItem[]) => {
    setHeadings(extractedHeadings);
  }, []);

  // Handle heading click from TOC
  const handleHeadingClick = useCallback((headingId: string) => {
    setScrollToHeading(headingId);
    // Reset after scroll to allow re-clicking same heading
    setTimeout(() => setScrollToHeading(null), 1000);
  }, []);

  // Handle document selection - reset headings and scroll
  const handleDocumentSelect = useCallback(async (filename: string) => {
    setHeadings([]);
    setScrollToHeading(null);
    await selectDocument(filename);
  }, [selectDocument]);

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (error && !currentDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DocumentList
        documents={documents}
        selectedDocument={currentDocument?.filename || null}
        onSelect={handleDocumentSelect}
        headings={headings}
        onHeadingClick={handleHeadingClick}
      />
      {currentDocument && (
        <DocumentViewer
          content={currentDocument.content}
          filename={currentDocument.filename}
          onHeadingsExtracted={handleHeadingsExtracted}
          scrollToHeading={scrollToHeading}
        />
      )}
      <ChatInput />
    </div>
  );
};