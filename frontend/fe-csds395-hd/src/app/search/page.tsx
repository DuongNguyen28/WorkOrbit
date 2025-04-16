'use client'

import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import SearchBar from '../../components/SearchBar';
import Categories from '../../components/Categories';
import SearchResultItem from '../../components/SearchResultItem';
import { NextPage } from 'next';
import Header from '@/components/header/Header';

interface SearchResult {
  id: number;
  fileName: string;
  modified: string;
  category: string;
}

const searchResults: SearchResult[] = [
  { id: 1, fileName: 'Q4 Financial Report.pdf', modified: '2 days ago', category: 'PDF Files' },
  { id: 2, fileName: 'Project Proposal.docx', modified: 'yesterday', category: 'Word Documents' },
  { id: 3, fileName: 'Q4 Financial Report.pdf', modified: '2 days ago', category: 'PDF Files' },
  { id: 4, fileName: 'Project Proposal.docx', modified: 'yesterday', category: 'Word Documents' },
];

const allowedFileTypes = ['.docx', '.pdf', '.xlsx', '.jpg', '.jpeg', '.png'];

const isFileTypeAllowed = (file: File) => {
  const fileName = file.name.toLowerCase();
  return allowedFileTypes.some(ext => fileName.endsWith(ext));
}

const SearchPage: NextPage = () => {
  const [query, setQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({ pdf: 0, docx: 0, xlsx: 0, image: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch('http://localhost:8000/search/summary');
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!isFileTypeAllowed(droppedFile)) {
        alert('File type not allowed. Please upload one of the following file types: .docx, .pdf, .xlsx, .jpg, .jpeg, .png');
        return;
      }
      setSelectedFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:8000/search/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      console.log('Upload successful');
      setShowSuccessModal(true);
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const SuccessModal = ({ onNext }: { onNext: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-2xl p-6 w-full max-w-md border-2 border-blue-500 min-h-[300px] flex flex-col items-center justify-center">
          <button
            onClick={() => {
              setShowSuccessModal(false);
              setIsModalOpen(false);
            }}
            className="bg-red-500 text-white rounded-full p-2 absolute right-4 top-4"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          <CheckCircleIcon className="h-16 w-16 text-green-500 mb-2 mt-10" />
          <h2 className="text-2xl font-bold text-black mb-2">Upload Successful</h2>
          <p className="text-gray-600 mb-4">Your file has been uploaded successfully.</p>
          <button
            onClick={onNext}
            className="bg-blue-500 text-white py-2 rounded-lg w-full mt-12"
          >
            Upload Next File
          </button>
        </div>
      </div>
    );
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-6 w-full max-w-lg border-2 border-blue-500 min-h-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2"
              aria-label="Close"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            <div className="text-xl font-bold text-black mb-2">Upload</div>
            <div className="flex flex-col items-center w-full h-full">
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="w-full h-64">
                  {selectedFile ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <p className="text-gray-800 mb-2">Selected file: {selectedFile.name}</p>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col items-center justify-center border-2 border-dashed ${dragActive ? 'border-blue-500' : 'border-gray-300'} rounded-lg p-4 w-full h-full`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <ArrowUpTrayIcon className="h-16 w-16 text-black mb-4" />
                      <h2 className="text-2xl font-bold text-black mb-2">Upload Documents</h2>
                      <p className="text-gray-600 mb-4 text-center">Drag and drop files here or click to browse</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Allowed file types: .docx, .pdf, .xlsx, .jpg, .jpeg, .png
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                      >
                        Choose
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg w-full disabled:opacity-50 mt-4"
              >
                {isUploading ? (
                  <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  'Ready to send'
                )}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".docx, .pdf, .xlsx, .jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  if (!isFileTypeAllowed(file)) {
                    alert('File type not allowed. Please upload one of the following file types: .docx, .pdf, .xlsx, .jpg, .jpeg, .png');
                    return;
                  }
                  setSelectedFile(file);
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      )}
      {showSuccessModal && (
        <SuccessModal
          onNext={() => {
            setShowSuccessModal(false);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default SearchPage;