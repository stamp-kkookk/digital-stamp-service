import { apiClient } from './client';

export interface PingResponse {
  status: string;
  message: string;
}

export const pingApi = {
  ping: async (): Promise<PingResponse> => {
    const response = await apiClient.get<PingResponse>('/ping');
    return response.data;
  },
};
