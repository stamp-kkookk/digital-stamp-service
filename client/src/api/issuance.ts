import { apiClient } from './client';

export interface CreateIssuanceRequest {
  storeId: number;
  clientRequestId: string;
}

export interface IssuanceRequestResponse {
  id: number;
  walletId: number;
  storeId: number;
  storeName: string;
  stampCardId: number;
  stampCardTitle: string;
  clientRequestId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
}

export interface PendingRequestsResponse {
  requests: IssuanceRequestResponse[];
}

export const issuanceApi = {
  createRequest: async (data: CreateIssuanceRequest): Promise<IssuanceRequestResponse> => {
    const response = await apiClient.post('/api/issuance', data);
    return response.data;
  },

  getRequest: async (id: number): Promise<IssuanceRequestResponse> => {
    const response = await apiClient.get(`/api/issuance/${id}`);
    return response.data;
  },

  getPendingRequests: async (storeId: number): Promise<IssuanceRequestResponse[]> => {
    const response = await apiClient.get('/api/owner/issuance/pending', {
      params: { storeId },
    });
    return response.data;
  },

  approveRequest: async (id: number): Promise<IssuanceRequestResponse> => {
    const response = await apiClient.post(`/api/owner/issuance/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: number, reason: string): Promise<IssuanceRequestResponse> => {
    const response = await apiClient.post(`/api/owner/issuance/${id}/reject`, { reason });
    return response.data;
  },
};
