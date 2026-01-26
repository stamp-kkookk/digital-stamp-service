import apiClient from '../../../lib/api/client';
import type { OwnerStore } from '../types';

export const fetchOwnerStores = async (): Promise<OwnerStore[]> => {
  const response = await apiClient.get('/v1/owner/stores');
  return response.data;
};
