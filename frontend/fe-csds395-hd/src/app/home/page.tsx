'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AuthPanel from '@components/header/Auth/AuthPanel';

export default function Home() {
  const [mode, setMode] = useState<'signup' | 'login'>('login');

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   console.log(`Submitting ${mode} form`);
  // };

  const handleSwitchMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  return (
    <div
      className="min-h-screen flex flex-row"
      style={{
        backgroundImage: 'url(/images/LoginBackground.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-1/2 flex justify-center items-center">
        <Image
          src="/images/WorkOrbitLogo.png"
          alt="WorkOrbit Logo"
          width={200}
          height={200}
        />
      </div>

      <div className="w-1/2 flex justify-center items-center">
        <AuthPanel
          mode={mode}
          // onSubmit={handleSubmit}
          onSwitchMode={handleSwitchMode}
          className="h-1/2 flex flex-col justify-center items-center"
        />
      </div>
    </div>
  );
}