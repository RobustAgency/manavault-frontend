export const LoadingState = () => (
    <div className="container mx-auto py-8">
        <div className="mb-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
    </div>
);
