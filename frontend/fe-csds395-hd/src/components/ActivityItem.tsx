import React from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  subtext: string;
  onClick?: () => void;
}

export default function ActivityItem({ icon, title, subtext, onClick }: ActivityItemProps) {
  return (
    <div 
      className="flex justify-between items-center p-4 bg-gray-100 rounded-lg"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon}
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{subtext}</p>
        </div>
      </div>
      <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
    </div>
  );
}