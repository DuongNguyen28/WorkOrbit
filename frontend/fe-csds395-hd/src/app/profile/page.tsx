'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/header/Header';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub?: string;
}

/**
 * UserPage component implements a profile form with controlled inputs and avatar upload
 */
export default function UserPage() {
  // State hooks for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [location, setLocation] = useState('');

  // Avatar state and file input ref
  const defaultAvatar = 'favicon.ico';
  const [avatar, setAvatar] = useState(defaultAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) return;

      let emailFromToken: string | undefined;
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        emailFromToken = decoded.sub;
      } catch {
        console.warn('Invalid token');
        return;
      }
      if (!emailFromToken) return;

      try {
        const res = await fetch(
          `http://localhost:8000/user?email=${encodeURIComponent(emailFromToken)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setUsername(data.username);
        setEmail(data.email);
        // setPassword(data.password);
        // leave password blank for user to enter new one
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, []);

  // Handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic (e.g., POST to backend)
    console.log({ username, email, password, location, avatar });
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Delete account');
  };

  const handleAvatarError = () => {
    // use warn instead of error so Next.js won't show its red overlay
    console.warn('Failed to load avatar image. Reverting to placeholder.');
    // only reset if we weren't already showing the placeholder
    if (avatar !== defaultAvatar) {
      setAvatar(defaultAvatar);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header></Header>

      {/* Content */}
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
          {/* Profile Header */}
          <h1 className="text-2xl font-medium text-center mb-6">My Profile</h1>
          
          {/* Avatar with upload */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-2 border-blue-[#f8f9fa]">
            <Image
              src={avatar}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized
              loader={({ src }) => src}
              onError={handleAvatarError}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="bg-blue-600 p-2 rounded-full border-2 border-white opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                📷
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Form (controlled) */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">User Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Password */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div> */}

            {/* Change Password
            <button
              type="button"
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-md border border-gray-300 inline-flex items-center justify-center"
            >
              🔒 Change Password
            </button> */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-10 right-0 px-3 flex items-center text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-md inline-flex items-center justify-center"
              >
                💾 Save Changes
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-md inline-flex items-center justify-center"
              >
                🗑️ Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}