'use client';

import React from 'react';
import SearchResultItem from '@/components/SearchResultItem';

interface TransformedResult {
    id: number;
    fileName: string;
    modified: string;
    category: string;
    file_path: string;
}

interface FullResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TransformedResult[];
  onDelete: (id: number) => void;
}

const FullResultsModal: React.FC<FullResultsModalProps> = ({ isOpen, onClose, results, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Search Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        </div>
        <div className="space-y-4">
          {results.map((result) => (
            <SearchResultItem
                key={result.id}
                result={result}
                onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullResultsModal;
