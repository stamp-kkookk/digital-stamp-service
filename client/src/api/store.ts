import { apiClient } from './client';
import type { Store, CreateStoreRequest, UpdateStoreRequest } from '../types/store';

export const storeApi = {
  getStores: async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>('/owner/stores');
    return response.data;
  },

  getStore: async (storeId: number): Promise<Store> => {
    const response = await apiClient.get<Store>(`/owner/stores/${storeId}`);
    return response.data;
  },

  createStore: async (data: CreateStoreRequest): Promise<Store> => {
    const response = await apiClient.post<Store>('/owner/stores', data);
    return response.data;
  },

  updateStore: async (storeId: number, data: UpdateStoreRequest): Promise<Store> => {
    const response = await apiClient.put<Store>(`/owner/stores/${storeId}`, data);
    return response.data;
  },

  deleteStore: async (storeId: number): Promise<void> => {
    await apiClient.delete(`/owner/stores/${storeId}`);
  },
};
