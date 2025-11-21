'use client';

import { PlusIcon } from 'lucide-react';

export const EmptyState = () => {
    return (
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-gray-50">
            <div className="max-w-sm mx-auto">
                <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No suppliers added yet</p>
                <p className="text-xs text-muted-foreground">
                    Select a supplier above to start adding products to your purchase order
                </p>
            </div>
        </div>
    );
};
