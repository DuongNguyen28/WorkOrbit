import CategoryCard from './CategoryCard';
import { DocumentTextIcon, DocumentIcon, TableCellsIcon, PhotoIcon } from '@heroicons/react/24/solid';

export default function Categories() {
  const categories = [
    { icon: <DocumentTextIcon className="h-8 w-8 text-red-500" />, title: 'PDF Files', count: 128 },
    { icon: <DocumentIcon className="h-8 w-8 text-blue-500" />, title: 'Word Documents', count: 85 },
    { icon: <TableCellsIcon className="h-8 w-8 text-green-500" />, title: 'Spreadsheets', count: 64 },
    { icon: <PhotoIcon className="h-8 w-8 text-yellow-500" />, title: 'Images', count: 256 },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <CategoryCard key={index} category={category} />
        ))}
      </div>
    </section>
  );
}