import React, { useEffect, useState } from 'react';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { DocumentSelector } from './components/DocumentSelector';
import { DocumentViewer } from './components/DocumentViewer';
import { ChatWidget } from './components/ChatWidget';
const DOCUMENTS = ['doc1.md', 'doc2.md'];

const App: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(DOCUMENTS[0]);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!selectedDocument) return;
      try {
        const text = await readTextFile(`documents/${selectedDocument}`, {
          dir: BaseDirectory.Resource
        });
        setContent(text);
      } catch (e) {
        setContent('# Error\nCould not load document.');
      }
    };
    load();
  }, [selectedDocument]);

  return (
    <div className="app-root">
      <DocumentSelector
        documents={DOCUMENTS}
        selected={selectedDocument}
        onSelect={setSelectedDocument}
      />
      <div className="viewer-container">
        <DocumentViewer markdown={content} />
      </div>
      <ChatWidget />
    </div>
  );
};

export default App;
