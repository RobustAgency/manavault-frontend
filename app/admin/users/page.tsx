'use client';

import { useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UsersTable, { UsersTableRef } from '@/components/admin/dashboard/UsersTable';
import { CreateUserForm } from '@/components/admin/CreateUserForm';

export default function UsersPage() {
    const tableRef = useRef<UsersTableRef>(null);

    const handleRefresh = () => {
        tableRef.current?.refresh();
    };

    const handleUserCreated = () => {
        handleRefresh();
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Users Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts and permissions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <CreateUserForm onSuccess={handleUserCreated} />
                </div>
            </div>

            <UsersTable ref={tableRef} />
        </div>
    );
}

