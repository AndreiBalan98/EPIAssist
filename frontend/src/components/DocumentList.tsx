/**
 * Left sidebar with document list.
 */
interface DocumentListProps {
  documents: string[];
  selectedDocument: string | null;
  onSelect: (filename: string) => void;
}

export const DocumentList = ({ documents, selectedDocument, onSelect }: DocumentListProps) => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
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
    </div>
  );
};