// src/components/header/Auth/AuthPanel.tsx (or wherever it is)
'use client'; // Mark as a Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirection

interface AuthPanelProps {
  mode: 'signup' | 'login';
  // onSubmit prop is removed as submission is handled internally now
  onSwitchMode: () => void;
  className?: string;
  // Optional: Add props if the parent needs notification of success/error
  // onSuccess?: () => void;
  // onError?: (errorMsg: string) => void;
}

function AuthPanel({ mode, onSwitchMode, className /*, onSuccess, onError */ }: AuthPanelProps) {
  // Determine texts based on mode
  const title = mode === 'signup' ? 'Sign Up' : 'Log In';
  const buttonText = mode === 'signup' ? 'Sign Up' : 'Login';
  const linkText = mode === 'signup' ? 'Already have an account?' : "Don't have an account?";
  const linkAction = mode === 'signup' ? 'Login here' : 'Sign Up here';

  // == State Hooks ==
  // NOTE: Using 'username' based on your placeholder. Change to 'email' if needed.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Add state for other fields if needed for signup (e.g., email, name)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Hook for programmatic navigation

  // == Internal Submit Handler ==
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    setIsLoading(true);
    setError(null);

    const isLogin = mode === 'login';
    const url = isLogin ? 'http://localhost:8000/login' : 'http://localhost:8000/register';
    
    const payload = isLogin ? { username, password } : { username, email, password };

    console.log(`Submitting ${mode} request to: ${url}`);
    console.log("Payload being sent:", payload); // <-- ADD THIS LINE

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json(); 
      console.log('Authentication successful:', data);

      if (isLogin) {
        router.push('/translation');
      } else {
        alert('Sign up successful! Please log in.'); 
        onSwitchMode(); 
      }

    } catch (err: any) {
      console.error(`Failed to ${mode}:`, err);
      setError(err.message || `An unexpected error occurred during ${mode}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // == JSX Structure ==
  return (
    <div
      // Apply base styles + any passed className
      className={`bg-white bg-opacity-20 backdrop-blur-md rounded-3xl shadow-lg p-5 w-80 flex flex-col items-center ${className}`}
    >
      <h2 className="text-white text-2xl font-bold mb-5">{title}</h2>

      {/* Display Error Message */}
      {error && (
        <p className="text-red-400 bg-red-100 border border-red-400 rounded p-2 mb-4 w-full text-center text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        {/* Controlled Input for Username */}
        <input
          type="text" // Change to "email" if backend expects email
          placeholder="Username" // Change placeholder if using email
          value={username} // Bind value to state
          onChange={(e) => setUsername(e.target.value)} // Update state on change
          required // Basic HTML5 validation
          disabled={isLoading} // Disable input when loading
          className="bg-white rounded-3xl p-2 mb-4 w-full text-black placeholder-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-[#003459] focus:outline-none transition-colors duration-200 disabled:opacity-50"
        />

        {/* Controlled Input for Password */}
        <input
          type="password"
          placeholder="Password"
          value={password} // Bind value to state
          onChange={(e) => setPassword(e.target.value)} // Update state on change
          required // Basic HTML5 validation
          disabled={isLoading} // Disable input when loading
          className="bg-white rounded-3xl p-2 mb-4 w-full text-black placeholder-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-[#003459] focus:outline-none transition-colors duration-200 disabled:opacity-50"
        />

        {mode === 'signup' && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="bg-white rounded-3xl p-2 mb-4 w-full text-black placeholder-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-[#003459] focus:outline-none transition-colors duration-200 disabled:opacity-50"
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading} // Disable button when loading
          className="bg-[#003459] text-white font-bold py-2 px-4 rounded-3xl w-full shadow-md hover:bg-[#002a45] transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : buttonText}
        </button>
      </form>

      {/* Switch Mode Link */}
      <p className="text-white text-sm mt-4 text-center">
        {linkText}{' '}
        <button // Changed span to button for better accessibility/semantics
          type="button"

          onClick={onSwitchMode}
          disabled={isLoading} // Optionally disable while loading
          className="text-[#003459] underline cursor-pointer hover:text-[#001a2e] transition-colors duration-200 font-bold bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {linkAction}
        </button>
      </p>
    </div>
  );
}

export default AuthPanel;