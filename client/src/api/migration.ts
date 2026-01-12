import { apiClient } from './client';

export interface CreateMigrationRequest {
  storeId: number;
  photoFileName: string;
}

export interface MigrationRequestResponse {
  id: number;
  walletId: number;
  storeId: number;
  storeName: string;
  stampCardId: number;
  stampCardTitle: string;
  photoUrl: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approvedStampCount?: number;
  rejectReason?: string;
  processedAt?: string;
  createdAt: string;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
}

export const migrationApi = {
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createMigrationRequest: async (data: CreateMigrationRequest): Promise<MigrationRequestResponse> => {
    const response = await apiClient.post('/api/migration', data);
    return response.data;
  },

  getMyMigrationRequests: async (): Promise<MigrationRequestResponse[]> => {
    const response = await apiClient.get('/api/migration');
    return response.data;
  },

  getSubmittedRequests: async (storeId: number): Promise<MigrationRequestResponse[]> => {
    const response = await apiClient.get('/api/owner/migration/submitted', {
      params: { storeId },
    });
    return response.data;
  },

  getAllRequests: async (storeId: number): Promise<MigrationRequestResponse[]> => {
    const response = await apiClient.get('/api/owner/migration/all', {
      params: { storeId },
    });
    return response.data;
  },

  approveRequest: async (id: number, approvedCount: number): Promise<MigrationRequestResponse> => {
    const response = await apiClient.post(`/api/owner/migration/${id}/approve`, {
      approvedCount,
    });
    return response.data;
  },

  rejectRequest: async (id: number, reason: string): Promise<MigrationRequestResponse> => {
    const response = await apiClient.post(`/api/owner/migration/${id}/reject`, {
      reason,
    });
    return response.data;
  },
};
