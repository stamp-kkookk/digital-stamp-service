import { apiClient } from './client';
import type { PublicStampCard } from '../types/stampcard';

export interface PublicStore {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
}

export const publicApi = {
  getStore: async (storeId: number): Promise<PublicStore> => {
    const response = await apiClient.get<PublicStore>(`/public/stores/${storeId}`);
    return response.data;
  },

  getActiveStampCard: async (storeId: number): Promise<PublicStampCard> => {
    const response = await apiClient.get<PublicStampCard>(`/public/stores/${storeId}/active-stampcard`);
    return response.data;
  },
};
