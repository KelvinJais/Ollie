import { Skeleton } from "./ui/skeleton";

function SkeletonLoader() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-4 bg-gray-100 rounded-2xl py-3 px-4 mb-4">
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Company sections skeleton */}
      {[1, 2, 3].map((companyIndex) => (
        <div key={companyIndex} className="mb-8">
          {/* Company header skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Job cards skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((jobIndex) => (
              <div key={jobIndex} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
