import React, { useState } from 'react';

interface DocumentSelectorProps {
  documents: string[];
  selected: string | null;
  onSelect: (doc: string) => void;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  selected,
  onSelect
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`doc-selector ${open ? 'open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="doc-selector-circle" />
      {open && (
        <div className="doc-selector-menu">
          {documents.map((name) => (
            <button
              key={name}
              className={`doc-selector-item ${selected === name ? 'active' : ''}`}
              onClick={() => onSelect(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
