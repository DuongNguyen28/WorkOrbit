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

interface SearchResult {
  id: number;
  fileName: string;
  modified: string;
  category: string;
}

const searchResults: SearchResult[] = [
  { id: 1, fileName: 'Q4 Financial Report.pdf', modified: '2 days ago', category: 'PDF Files' },
  { id: 2, fileName: 'Project Proposal.docx', modified: 'yesterday', category: 'Word Documents' },
  { id: 4, fileName: 'Project Proposal.xlsx', modified: 'yesterday', category: 'Spreadsheets' },
];

const SearchPage: NextPage = () => {
  const [query, setQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({ pdf: 0, docx: 0, xlsx: 0, image: 0 });

  useAuthGuard();

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const filteredResults = searchResults.filter((result) =>
    result.fileName.toLowerCase().includes(query.toLowerCase())
  );

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
        <div className="w-full">
          <SearchBar value={query} onChange={handleSearch} />
        </div>
        <Categories counts={categoryCounts} />
        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Search Results:</h2>
          <a href="#" className="text-blue-500">View All</a>
        </div>
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <SearchResultItem key={result.id} result={result} />
          ))}
        </div>
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
      <Chatbot />
    </div>
  );
};

export default SearchPage;