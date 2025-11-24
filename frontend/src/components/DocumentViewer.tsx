/**
 * Main document viewer - A4 width, centered.
 */
import ReactMarkdown from 'react-markdown';

interface DocumentViewerProps {
  content: string;
  filename: string;
}

export const DocumentViewer = ({ content, filename }: DocumentViewerProps) => {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-4">
            {filename.replace('.md', '')}
          </h1>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};