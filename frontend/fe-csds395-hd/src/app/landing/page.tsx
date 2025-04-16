"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderComponent from '@/components/header/Header';
import WelcomeComponent from '@/components/Welcome';
import ActionButtonsComponent from '@/components/ActionButtons';
import RecentActivityComponent from '@/components/RecentActivities';
import UploadModal from '@/components/Modals/Upload';
import SuccessModal from '@/components/Modals/Success';
import Chatbot from '@/components/header/Chatbot';

export default function LandingPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const router = useRouter();

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    setIsSuccessOpen(true);
  };

  const handleNextUpload = () => {
    setIsSuccessOpen(false);
    setIsUploadOpen(true);
  };

  const handleCardClick = (action: string) => {
    switch (action) {
      case 'upload':
        setIsUploadOpen(true);
        break;
      case 'search':
        router.push('/search');
        break;
      case 'translation':
        router.push('/translation');
        break;
      default:
        router.push('/landing');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <HeaderComponent />
      <main className="p-4">
        <WelcomeComponent />
        <ActionButtonsComponent onClick={handleCardClick} />
        <RecentActivityComponent />
      </main>
      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
      {isSuccessOpen && (
        <SuccessModal
          onClose={() => setIsSuccessOpen(false)}
          onNext={handleNextUpload}
        />
      )}
      <Chatbot />
    </div>
  );
}