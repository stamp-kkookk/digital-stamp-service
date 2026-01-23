import type { StoreStampCardSummaryResponse } from 'store-types';
import apiClient from './axios';

export const getStoreSummary = async (storeId: string) => {
  const { data } = await apiClient.get<StoreStampCardSummaryResponse>(
    `/customer/stores/${storeId}/summary`
  );
  return data;
};
