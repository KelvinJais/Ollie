import { Button } from "./ui/button";

type NoJobsProps = {
  showOnlyNew: boolean;
  onToggleFilter: () => void;
};

function NoJobs({ showOnlyNew, onToggleFilter }: NoJobsProps) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center py-16">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {showOnlyNew ? "No new jobs found" : "No jobs available"}
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {showOnlyNew
            ? "There are currently no new jobs matching your criteria. Try switching to view all jobs or check back later."
            : "There are currently no jobs available. Check back later for new opportunities."}
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={onToggleFilter}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {showOnlyNew ? "Show All Jobs" : "Show New Jobs Only"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NoJobs;
