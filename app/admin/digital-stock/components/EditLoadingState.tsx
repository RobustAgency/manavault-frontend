export const EditLoadingState = () => (
    <div className="container mx-auto py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="bg-card border rounded-lg shadow-sm">
                <div className="border-b p-6">
                    <div className="h-6 bg-muted rounded w-1/3" />
                </div>
                <div className="p-6 space-y-4">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                </div>
            </div>
        </div>
    </div>
);
