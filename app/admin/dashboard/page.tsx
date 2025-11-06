'use client'

import React, { useRef } from 'react'
import UsersTable from '@/components/admin/dashboard/UsersTable'
import { CreateUserForm } from '@/components/admin/CreateUserForm'

const AdminDashboardPage = () => {
    const usersTableRef = useRef<{ refresh: () => void } | null>(null);

    const handleUserCreated = () => {
        // Refresh users table after user creation
        if (usersTableRef.current) {
            usersTableRef.current.refresh();
        }
    };

    return (
        <React.Fragment>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage users and system settings</p>
                </div>
                <CreateUserForm onSuccess={handleUserCreated} />
            </div>

            <div className="bg-white rounded-lg shadow">
                <UsersTable ref={usersTableRef} />
            </div>
        </React.Fragment>
    )
}

export default AdminDashboardPage