import React from 'react';
import { FiFile } from 'react-icons/fi';

interface FileListProps {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (filename: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, selectedFile, onSelectFile }) => {
  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Files</h2>
      </div>
      <nav className="mt-2">
        <ul className="space-y-1">
          {files.map((filename) => (
            <li key={filename}>
              <button
                onClick={() => onSelectFile(filename)}
                className={`w-full flex items-center px-4 py-2 text-left text-sm font-medium ${
                  selectedFile === filename
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiFile className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{filename}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default FileList;
