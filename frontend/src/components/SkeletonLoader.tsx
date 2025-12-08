/**
 * Skeleton loader for documents - shows while loading.
 * Responsive design with mobile header offset.
 */

export const SkeletonLoader = () => {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50 pt-12 lg:pt-0 pb-24">
      <div className="mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:max-w-4xl lg:px-8 lg:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 animate-pulse">
          {/* Title skeleton */}
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          
          {/* Paragraph skeletons */}
          <div className="space-y-3 sm:space-y-4">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/5"></div>
          </div>

          {/* Section skeleton */}
          <div className="mt-6 sm:mt-8">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-11/12"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>

          {/* Another section skeleton */}
          <div className="mt-6 sm:mt-8">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-10/12"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-9/12"></div>
            </div>
          </div>

          {/* List skeleton */}
          <div className="mt-6 sm:mt-8 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};