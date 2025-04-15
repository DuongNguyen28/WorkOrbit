import React from 'react';
import { DocumentTextIcon, DocumentIcon, TableCellsIcon, PhotoIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';

interface SearchResult {
  id: number;
  fileName: string;
  modified: string;
  category: string;
}

const getIcon = (category: string) => {
  switch (category) {
    case 'PDF Files':
      return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
    case 'Word Documents':
      return <DocumentIcon className="h-6 w-6 text-blue-500" />;
    case 'Spreadsheets':
      return <TableCellsIcon className="h-6 w-6 text-green-500" />;
    case 'Images':
      return <PhotoIcon className="h-6 w-6 text-yellow-500" />;
    default:
      return <DocumentIcon className="h-6 w-6 text-gray-500" />;
  }
};

const SearchResultItem: React.FC<{ result: SearchResult }> = ({ result }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center">
        {getIcon(result.category)}
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-800">{result.fileName}</h3>
          <p className="text-sm text-gray-500">Modified {result.modified}</p>
        </div>
      </div>
      <div>
        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
      </div>
    </div>
  );
};

export default SearchResultItem;