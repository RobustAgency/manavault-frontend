import { useState, useEffect, useCallback, useMemo } from 'react'
import { UserFilters } from '@/interfaces/User'
import { toast } from 'react-toastify'
import { useGetUsersQuery } from '@/lib/redux/features'

export type TableUser = {
    id: string | number
    full_name: string
    email: string
    status: "approved" | "rejected" | "pending"
    role: Role | null
}

export type Role = {
    id: string | number
    name: string
}

interface PaginationState {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface UseUsersReturn {
    users: TableUser[]
    loading: boolean
    error: string | null
    pagination: PaginationState
    filters: UserFilters
    fetchUsers: () => Promise<void>
    handleSearch: (searchTerm: string) => void
    handlePageChange: (page: number) => void
    handleRefresh: () => void
    setFilters: (filters: UserFilters) => void
}

export const useUsers = (): UseUsersReturn => {
    const [filters, setFilters] = useState<UserFilters>({
        page: 1,
        status: undefined,
        term: undefined
    })

    const normalizeRole = (user: any): Role | null => {
        const roleValue = user?.role ?? user?.role_name ?? user?.role?.name ?? user?.roles?.[0]
        if (!roleValue) return null
        if (typeof roleValue === "string") {
            return { id: "", name: roleValue }
        }
        if (typeof roleValue === "object" && roleValue.name) {
            return { id: roleValue.id ?? "", name: roleValue.name }
        }
        return null
    }

    const transformUserToTableUser = (user: any): TableUser => ({
        id: user.id ?? user.supabase_id ?? "",
        full_name: user.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'N/A',
        email: user.email || 'N/A',
        status: user.is_approved ? 'approved' : 'pending',
        role: normalizeRole(user)
    })

    const { data, isLoading, isFetching, error, refetch } = useGetUsersQuery({
        page: filters.page || 1,
        term: filters.search,
        status: filters.status
    })

    const users = useMemo(() => {
        return (data?.data ?? []).map(transformUserToTableUser)
    }, [data])

    const pagination = useMemo<PaginationState>(() => {
        return (
            data?.pagination ?? {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0
            }
        )
    }, [data])

    const errorMessage = useMemo(() => {
        if (!error) return null
        const typedError = error as { data?: { message?: string } }
        return typedError?.data?.message || 'Failed to fetch users'
    }, [error])

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage)
        }
    }, [errorMessage])

    const handleSearch = useCallback((searchTerm: string) => {
        setFilters(prev => ({
            ...prev,
            search: searchTerm || undefined,
            page: 1
        }))
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setFilters(prev => ({
            ...prev,
            page
        }))
    }, [])

    const handleRefresh = useCallback(() => {
        refetch()
    }, [refetch])

    return {
        users,
        loading: isLoading || isFetching,
        error: errorMessage,
        pagination,
        filters,
        fetchUsers: async () => {
            await refetch()
        },
        handleSearch,
        handlePageChange,
        handleRefresh,
        setFilters
    }
}
