import React from 'react';
import SearchResultItem from './SearchResultItem';

interface TransformedResult {
  id: number;
  fileName: string;
  modified: string;
  category: string;
  file_path: string;
}

interface SearchResultsProps {
  searchResults: TransformedResult[];
  isLoading: boolean;
  hasSearched: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, isLoading, hasSearched }) => {
    return (
        <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        ) : hasSearched ? (
            searchResults.length > 0 ? (
            searchResults.map((result) => (
                <SearchResultItem key={result.id} result={result} />
            ))
            ) : (
            <p>No results found.</p>
            )
        ) : (
            <p></p>
        )}
        </div>
    );
};

export default SearchResults;