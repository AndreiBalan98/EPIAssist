import React from 'react';
import ReactMarkdown from 'react-markdown';

interface DocumentViewerProps {
  markdown: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ markdown }) => {
  return (
    <div className="document-viewer">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
