'use client';

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
        <div className="h-8 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
        <div className="h-6 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="grid gap-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

