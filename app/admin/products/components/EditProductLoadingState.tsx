export const EditProductLoadingState = () => (
    <div className="container mx-auto py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
            </div>
        </div>
    </div>
);
