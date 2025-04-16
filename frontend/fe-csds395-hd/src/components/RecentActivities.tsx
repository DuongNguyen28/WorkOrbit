import ActivityItem from './ActivityItem';
import { DocumentTextIcon, DocumentIcon, TableCellsIcon } from '@heroicons/react/24/solid';

export default function RecentActivities() {
  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
        <a href="#" className="text-blue-500">View All</a>
      </div>
      <div className="space-y-4">
        <ActivityItem
          icon={<DocumentTextIcon className="h-8 w-8 text-red-500" />}
          title="Project_Proposal.docx"
          subtext="Translated to Spanish + 2 hours ago"
        />
        <ActivityItem
          icon={<DocumentIcon className="h-8 w-8 text-blue-500" />}
          title="Financial_Report_2025.pdf"
          subtext="Uploaded + 5 hours ago"
        />
        <ActivityItem
          icon={<TableCellsIcon className="h-8 w-8 text-green-500" />}
          title="Sales_Data.xlsx"
          subtext="Translated to French + 1 day ago"
        />
      </div>
    </section>
  );
}