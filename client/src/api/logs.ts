import { apiClient } from './client';

export interface EventLogResponse {
  id: number;
  eventType: 'STAMP' | 'REDEEM';
  eventSubType: string;
  walletId: number;
  storeId: number;
  storeName: string;
  stampCardId: number;
  stampCardTitle: string;
  stampDelta?: number;
  rewardName?: string;
  requestId?: string;
  sessionToken?: string;
  notes?: string;
  createdAt: string;
}

export interface LogQueryParams {
  storeId?: number;
  walletId?: number;
  from?: string;
  to?: string;
}

export const logsApi = {
  getStampLogs: async (params: LogQueryParams): Promise<EventLogResponse[]> => {
    const response = await apiClient.get('/api/owner/logs/stamps', { params });
    return response.data;
  },

  getRedeemLogs: async (params: LogQueryParams): Promise<EventLogResponse[]> => {
    const response = await apiClient.get('/api/owner/logs/redeems', { params });
    return response.data;
  },

  getAllLogs: async (params: LogQueryParams): Promise<EventLogResponse[]> => {
    const response = await apiClient.get('/api/owner/logs/all', { params });
    return response.data;
  },
};
