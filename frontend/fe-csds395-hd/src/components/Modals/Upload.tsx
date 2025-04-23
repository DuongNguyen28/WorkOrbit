import React, { useState, useRef } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface UploadProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

const allowedFileTypes = ['.docx', '.pdf', '.xlsx', '.jpg', '.jpeg', '.png'];

const isFileTypeAllowed = (file: File) => {
  const fileName = file.name.toLowerCase();
  return allowedFileTypes.some(ext => fileName.endsWith(ext));
};

export default function Upload({ onClose, onUploadSuccess }: UploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onUploadSuccess();
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-lg border-2 border-blue-500 min-h-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
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
  );
}