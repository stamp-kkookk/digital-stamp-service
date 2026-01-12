import { apiClient } from './client';
import type { StampCard, CreateStampCardRequest } from '../types/stampcard';

export const stampCardApi = {
  getStampCard: async (stampCardId: number): Promise<StampCard> => {
    const response = await apiClient.get<StampCard>(`/owner/stampcards/${stampCardId}`);
    return response.data;
  },

  getActiveStampCardByStore: async (storeId: number): Promise<StampCard | null> => {
    try {
      const response = await apiClient.get<StampCard>(`/owner/stampcards/store/${storeId}/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createStampCard: async (data: CreateStampCardRequest): Promise<StampCard> => {
    const response = await apiClient.post<StampCard>('/owner/stampcards', data);
    return response.data;
  },
};
