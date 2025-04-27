import React from 'react';
import { DocumentIcon, DocumentTextIcon, TableCellsIcon, PhotoIcon } from '@heroicons/react/24/solid';

interface TransformedResult {
  id: number;
  fileName: string;
  modified: string;
  category: string;
  file_path: string;
}

interface SearchResultItemProps {
  result: TransformedResult;
  onDelete: (id: number) => void;
}

const getIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return <DocumentIcon className="h-8 w-8 text-red-500" />;
    case 'docx':
      return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
    case 'xlsx':
      return <TableCellsIcon className="h-8 w-8 text-green-500" />;
    case 'image':
      return <PhotoIcon className="h-8 w-8 text-yellow-500" />;
    default:
      return <DocumentTextIcon className="h-8 w-8 text-gray-400" />;
  }
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onDelete }) => {
  const { fileName, modified, category, file_path } = result;

  return (
    <div
      className="block p-4 rounded-lg hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        {getIcon(category)}
        <div 
          onClick={() => window.open(file_path, '_blank')}
          className="flex-1 cursor-pointer hover:underline"
        >
          <p className="font-semibold">{fileName}</p>
          <p className="text-sm text-gray-500">{modified}</p>
        </div>
        <button
          onClick={() => onDelete(result.id)}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SearchResultItem;