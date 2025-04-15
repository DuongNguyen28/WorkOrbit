interface CategoryCardProps {
  category: {
    icon: React.ReactNode;
    title: string;
    count: number;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col items-center">
      {category.icon}
      <h3 className="mt-2 text-lg font-medium text-gray-800">{category.title}</h3>
      <p className="text-sm text-gray-500">{category.count} files</p>
    </div>
  );
};

export default CategoryCard;