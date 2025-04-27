'use client'

import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import SearchBar from '../../components/SearchBar';
import Categories from '../../components/Categories';
import SearchResultItem from '../../components/SearchResultItem';
import { NextPage } from 'next';
import Header from '@/components/header/Header';
import UploadModal from '@/components/Modals/Upload';
import SuccessModal from '@/components/Modals/Success';
import Chatbot from '@/components/header/Chatbot';
import { useAuthGuard } from '@components/AuthGuard';
import SearchResults from '@/components/SearchResults';
import ConfirmModal from '@/components/Modals/Confirm';
import FullResultsModal from '@/components/Modals/FullResultsModal';

interface SearchResultItem {
  id: number;
  filename: string;
  uploaded_at: string;
  file_type: string;
  file_path: string;
}

interface TransformedResult {
  id: number;
  fileName: string;
  modified: string;
  category: string;
  file_path: string;
}

// interface SearchResultsProps {
//   searchResults: TransformedResult[];
//   isLoading: boolean;
//   hasSearched: boolean;
//   onDelete: (id: number) => void;
// }

// // const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, isLoading, hasSearched, onDelete }) => {
// //   return (
// //     <div className="space-y-4">
// //       {isLoading ? (
// //         <div className="flex justify-center items-center h-64">
// //           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
// //         </div>
// //       ) : hasSearched ? (
// //         searchResults.length > 0 ? (
// //           searchResults.map((result) => (
// //             <SearchResultItem key={result.id} result={result} onDelete={handleDelete}/>
// //           ))
// //         ) : (
// //           <p>No results found.</p>
// //         )
// //       ) : (
// //         <p></p>
// //       )}
// //     </div>
// //   );
// // };

const SearchPage: NextPage = () => {
  const [query, setQuery] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [searchResults, setSearchResults] = useState<TransformedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({ pdf: 0, docx: 0, xlsx: 0, image: 0 });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFullResultsModalOpen, setIsFullResultsModalOpen] = useState(false);

  const handleViewAll = () => {
    setIsFullResultsModalOpen(true);
  };

  useAuthGuard();

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      const response = await fetch(`http://localhost:8000/files/${confirmDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file.');
      }

      setSearchResults(prev => prev.filter(item => item.id !== confirmDeleteId));
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete the file. Please try again.');
    } finally {
      setIsConfirmModalOpen(false);
      setConfirmDeleteId(null);
    }
  };

  const askDelete = (id: number) => {
    setConfirmDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch('http://localhost:8000/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch category counts');
        }
        const data = await response.json();
        setCategoryCounts(data);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };
    fetchCategoryCounts();
  }, []);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);    

    try {
      let data: SearchResultItem[] = [];

      if (query == '') {
        const params = new URLSearchParams();

        if (selectedFileType) {
          params.append('file_type', selectedFileType);
        }

        const response = await fetch(`http://localhost:8000/recent_files?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch files.');
        }
        data = await response.json();
      }
      else {
        const params = new URLSearchParams({ 'query': query });
        if (selectedFileType) {
          params.append('file_type', selectedFileType);
        }
        const body = {
          query: query,
          ...(selectedFileType && { file_type: selectedFileType }),
        };

        const response = await fetch(`http://localhost:8000/search?${params.toString()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          throw new Error('Failed to search files.');
        }
        data = await response.json();
      }

      const transformedResults: TransformedResult[] = data.map(item => ({
        id: item.id,
        fileName: item.filename,
        modified: item.uploaded_at,
        category: item.file_type,
        file_path: item.file_path,
      }));
      setSearchResults(transformedResults);
    } catch (error) {
      console.error('Error searching:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    performSearch();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleUploadSuccess = () => {
    setIsModalOpen(false);
    setShowSuccessModal(true);
  };

  const handleNextUpload = () => {
    setShowSuccessModal(false);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mt-8">Document Search</h1>
        <form onSubmit={handleSubmit} className="flex items-center w-full mt-8">
          <div className="flex-grow">
            <SearchBar value={query} onChange={handleSearch} />
          </div>
          <div>
            <button
              type="submit"
              className="ml-2 px-4 bg-blue-500 text-white rounded border border-blue-700 h-10 hover:bg-[#002a45]"
            >
              Search
            </button>
          </div>
        </form>
        <Categories counts={categoryCounts} onSelectCategory={setSelectedFileType} />
        {hasSearched && (
          <div className="flex justify-between items-center mt-8 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Search Results:</h2>
            <button onClick={handleViewAll} className="text-blue-500">View All</button>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <SearchResults
          searchResults={searchResults.slice(0, 5)}
          isLoading={isLoading}
          hasSearched={hasSearched}
          onDelete={askDelete}
        />
      </main>
      <div className="fixed bottom-4 left-4">
        <button
          className="bg-[#1E3A8A] text-white rounded-full p-3 shadow-lg"
          onClick={() => setIsModalOpen(true)}
          aria-label="Open upload modal"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      {isModalOpen && (
        <UploadModal
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          onNext={handleNextUpload}
        />
      )}
      
      {isFullResultsModalOpen && (
        <FullResultsModal
          isOpen={isFullResultsModalOpen}
          onClose={() => setIsFullResultsModalOpen(false)}
          results={searchResults}
          onDelete={askDelete}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setConfirmDeleteId(null);
          }}
          message="Are you sure you want to delete this file?"
        />
      )}
      <Chatbot />
    </div>
  );
};

export default SearchPage;