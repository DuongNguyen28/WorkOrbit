import React, { useState } from 'react';
import CategoryCard from './CategoryCard';
import { DocumentTextIcon, DocumentIcon, TableCellsIcon, PhotoIcon } from '@heroicons/react/24/solid';

interface CategoriesProps {
  counts: {
    pdf: number;
    docx: number;
    xlsx: number;
    image: number;
  };
  onSelectCategory: (file_type: string) => void;
}

export default function Categories({ counts, onSelectCategory }: CategoriesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const categories = [
    { icon: <DocumentTextIcon className="h-8 w-8 text-red-500" />, title: 'PDF Files', count: counts.pdf, file_type: 'pdf' },
    { icon: <DocumentIcon className="h-8 w-8 text-blue-500" />, title: 'Word Documents', count: counts.docx, file_type: 'docx' },
    { icon: <TableCellsIcon className="h-8 w-8 text-green-500" />, title: 'Spreadsheets', count: counts.xlsx, file_type: 'xlsx' },
    { icon: <PhotoIcon className="h-8 w-8 text-yellow-500" />, title: 'Images', count: counts.image, file_type: 'image' },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            isSelected={selectedIndex === index}
            onClick={() => {
              if (selectedIndex === index) {
                setSelectedIndex(null);
                onSelectCategory('');
              } else {
                setSelectedIndex(index);
                onSelectCategory(category.file_type);
              }
            }}
          />
        ))}
      </div>
    </section>
  );
}