import React from 'react';

interface AuthPanelProps {
  mode: 'signup' | 'login';
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSwitchMode: () => void;
  className?: string;
}

function AuthPanel({ mode, onSubmit, onSwitchMode, className }: AuthPanelProps) {
  const title = mode === 'signup' ? 'Sign Up' : 'Log In';
  const buttonText = mode === 'signup' ? 'Sign Up' : 'Login';
  const linkText = mode === 'signup' ? 'Already have an account?' : "Don't have an account?";
  const linkAction = mode === 'signup' ? 'Login here' : 'Sign Up here';

  return (
    <div
      className={`bg-white bg-opacity-20 backdrop-blur-md rounded-3xl shadow-lg p-5 w-80 flex flex-col items-center ${className}`}
    >
      <h2 className="text-white text-2xl font-bold mb-5">{title}</h2>
      <form onSubmit={onSubmit} className="w-full">
        <input
          type="text"
          placeholder="Username"
          className="bg-white rounded-3xl p-2 mb-4 w-full text-black placeholder-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-[#003459] focus:outline-none transition-colors duration-200"
        />
        <input
          type="password"
          placeholder="Password"
          className="bg-white rounded-3xl p-2 mb-4 w-full text-black placeholder-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-[#003459] focus:outline-none transition-colors duration-200"
        />
        <button
          type="submit"
          className="bg-[#003459] text-white font-bold py-2 px-4 rounded-3xl w-full shadow-md hover:bg-[#002a45] transition-colors duration-200"
        >
          {buttonText}
        </button>
      </form>
      <p className="text-white text-sm mt-4 text-center">
        {linkText}{' '}
        <span
          className="text-[#003459] underline cursor-pointer hover:text-[#001a2e] transition-colors duration-200 font-bold"
          onClick={onSwitchMode}
        >
          {linkAction}
        </span>
      </p>
    </div>
  );
}

export default AuthPanel;