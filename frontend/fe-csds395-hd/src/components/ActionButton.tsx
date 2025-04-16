import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  subtext: string;
  backgroundColor: string;
  onClick?: () => void;
}

export default function ActionButton({ icon, title, subtext, backgroundColor, onClick }: ActionButtonProps) {
  return (
    <div
      className={`p-4 rounded-lg ${backgroundColor} cursor-pointer transform hover:scale-105 transition duration-300 hover:shadow-md`}
      onClick={onClick}
    >
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{subtext}</p>
    </div>
  );
}