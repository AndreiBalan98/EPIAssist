/**
 * Main home page component.
 */
import { DocumentList } from '@components/DocumentList';
import { DocumentViewer } from '@components/DocumentViewer';
import { ChatInput } from '@components/ChatInput';
import { useDocuments } from '@hooks/useDocuments';

export const Home = () => {
  const { documents, currentDocument, loading, error, selectDocument } = useDocuments();

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
        onSelect={selectDocument}
      />
      {currentDocument && (
        <DocumentViewer
          content={currentDocument.content}
          filename={currentDocument.filename}
        />
      )}
      <ChatInput />
    </div>
  );
};