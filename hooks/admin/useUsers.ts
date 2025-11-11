import { useState, useEffect, useCallback } from 'react'
import { getUsers } from '@/lib/admin-actions'
import { UserFilters } from '@/interfaces/User'
import { toast } from 'react-toastify'

export type TableUser = {
    id: string
    full_name: string
    email: string
    status: "approved" | "rejected" | "pending"
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
    const [users, setUsers] = useState<TableUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<UserFilters>({
        page: 1,
        status: undefined,
        search: undefined
    })
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const transformUserToTableUser = (user: any): TableUser => ({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'N/A',
        email: user.email || 'N/A',
        status: user.confirmed_at ? 'approved' : 'pending'
    })

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await getUsers({
                page: filters.page || 1,
                limit: 10,
                search: filters.search
            })

            if (!result.success) {
                toast.error(result.message || 'Failed to fetch users')
                setError(result.message || 'Failed to fetch users')
                return
            }

            if (!result.data) {
                toast.error('No data returned from server')
                setError('No data returned from server')
                return
            }

            const transformedUsers: TableUser[] = result.data.users.map(transformUserToTableUser)

            setUsers(transformedUsers)

            setPagination({
                page: result.data.page,
                limit: result.data.limit,
                total: result.data.total,
                totalPages: result.data.totalPages
            })
        } catch (err) {
            const errorMessage = 'Error fetching users'
            toast.error(errorMessage)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [filters])

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
        fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    return {
        users,
        loading,
        error,
        pagination,
        filters,
        fetchUsers,
        handleSearch,
        handlePageChange,
        handleRefresh,
        setFilters
    }
}
