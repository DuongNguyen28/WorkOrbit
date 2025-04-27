'use client';
import React, { useEffect, useState } from 'react';
import ActivityItem from './ActivityItem';
import { DocumentTextIcon, DocumentIcon, TableCellsIcon, PhotoIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

interface FileActivity {
  id: number;
  filename: string;
  file_type: string;
  uploaded_at: string;
  source: string;
  file_path: string;
}

export default function RecentActivities() {
  const [recentFiles, setRecentFiles] = useState<FileActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        const res = await fetch('http://localhost:8000/recent_files');
        if (!res.ok) throw new Error('Failed to fetch recent files');
        const data = await res.json();
        setRecentFiles(data);
      } catch (error) {
        console.error('Error fetching recent files:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentFiles();
  }, []);

  const getIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <DocumentIcon className="h-8 w-8 text-red-500" />;
      case 'docx':
        return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
      case 'xlsx':
        return <TableCellsIcon className="h-8 w-8 text-green-500" />;
      case 'image':
        return <PhotoIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return <DocumentTextIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
      </div>
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading recent activities...</p>
        ) : (
          recentFiles.slice(0,5).map((file) => (
            <ActivityItem
            key={file.id}
            icon={getIcon(file.file_type)}
            title={file.filename}
            subtext={`${capitalize(file.source)} (${dayjs(file.uploaded_at).utcOffset(-8).format('h:mm A [ET], MMM D')})`}
            onClick={() =>
              window.open(file.file_path, '_blank')
            }
            />
          ))
        )}
      </div>
    </section>
  );
}


function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}