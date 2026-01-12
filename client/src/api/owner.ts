import { apiClient } from './client';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/owner';

export const ownerApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/owner/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/owner/auth/login', data);
    return response.data;
  },
};
