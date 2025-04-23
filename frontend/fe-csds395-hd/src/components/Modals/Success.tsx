import React from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface SuccessProps {
  onClose: () => void;
  onNext: () => void;
}

export default function Success({ onClose, onNext }: SuccessProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md border-2 border-blue-500 min-h-[300px] flex flex-col items-center justify-center">
        <button
          onClick={onClose}
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
}