import { api, apiUtils, type ApiResponse } from '@/lib/api';
import { UserFilters, UsersApiResponse } from '@/interfaces/User';
import { User } from '@/interfaces/User';

export class UsersService {
    private baseUrl = '/users';

    async getUsers(filters: UserFilters = {}): Promise<UsersApiResponse> {
        const queryString = apiUtils.createQueryString(filters);
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        const response = await api.get<UsersApiResponse['data']>(url);
        return response;
    }

    async approveUser(userId: string): Promise<ApiResponse<User>> {
        return await api.post<User>(`${this.baseUrl}/${userId}/approve`);
    }

    async rejectUser(userId: string): Promise<ApiResponse<User>> {
        return await api.post<User>(`${this.baseUrl}/${userId}/revoke-approval`);
    }

}

export const usersService = new UsersService();
