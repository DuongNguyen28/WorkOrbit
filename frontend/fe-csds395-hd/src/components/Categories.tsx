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
}

export default function Categories({ counts }: CategoriesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const categories = [
    { icon: <DocumentTextIcon className="h-8 w-8 text-red-500" />, title: 'PDF Files', count: counts.pdf },
    { icon: <DocumentIcon className="h-8 w-8 text-blue-500" />, title: 'Word Documents', count: counts.docx },
    { icon: <TableCellsIcon className="h-8 w-8 text-green-500" />, title: 'Spreadsheets', count: counts.xlsx },
    { icon: <PhotoIcon className="h-8 w-8 text-yellow-500" />, title: 'Images', count: counts.image },
  ];

  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            isSelected={selectedIndex === index}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
    </section>
  );
}