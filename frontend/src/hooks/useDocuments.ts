/**
 * Custom hook for document operations.
 */
import { useState, useEffect } from 'react';
import { api } from '@services/api';

interface UseDocumentsReturn {
  documents: string[];
  currentDocument: { filename: string; content: string } | null;
  loading: boolean;
  error: string | null;
  selectDocument: (filename: string) => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<string[]>([]);
  const [currentDocument, setCurrentDocument] = useState<{ filename: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load document list on mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await api.listDocuments();
        setDocuments(docs);
        
        // Auto-select first document
        if (docs.length > 0) {
          await selectDocument(docs[0]);
        }
      } catch (err) {
        setError('Failed to load documents');
        console.error('Error loading documents:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Select and load specific document
  const selectDocument = async (filename: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const doc = await api.getDocument(filename);
      setCurrentDocument(doc);
    } catch (err) {
      setError(`Failed to load document: ${filename}`);
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    currentDocument,
    loading,
    error,
    selectDocument,
  };
};