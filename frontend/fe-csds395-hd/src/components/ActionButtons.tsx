import ActionButton from './ActionButton';
import { CloudArrowUpIcon, MagnifyingGlassIcon, FolderIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

interface ActionButtonsProps {
  onClick: (action: string) => void;
}

export default function ActionButtons({ onClick }: ActionButtonsProps) {
  const buttons = [
    {
      icon: <CloudArrowUpIcon className="h-8 w-8 text-green-500" />,
      title: "Upload Document",
      subtext: "Drag and drop or browse files",
      backgroundColor: "bg-green-100",
      action: "upload"
    },
    {
      icon: <MagnifyingGlassIcon className="h-8 w-8 text-purple-500" />,
      title: "Search Documents",
      subtext: "Find your files instantly",
      backgroundColor: "bg-purple-100",
      action: "search"
    },
    {
      icon: <FolderIcon className="h-8 w-8 text-yellow-500" />,
      title: "Manage Files",
      subtext: "Organize your documents",
      backgroundColor: "bg-yellow-100",
      action: "manage"
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-orange-500" />,
      title: "Translate",
      subtext: "Convert to any language",
      backgroundColor: "bg-orange-100",
      action: "translation"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {buttons.map((button, index) => (
        <ActionButton
          key={index}
          icon={button.icon}
          title={button.title}
          subtext={button.subtext}
          backgroundColor={button.backgroundColor}
          onClick={() => onClick(button.action)}
        />
      ))}
    </div>
  );
}