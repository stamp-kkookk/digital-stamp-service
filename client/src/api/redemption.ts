import { apiClient } from './client';

export interface RewardInstanceResponse {
  id: number;
  walletId: number;
  storeId: number;
  storeName: string;
  stampCardId: number;
  stampCardTitle: string;
  rewardName: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  expiresAt?: string;
  usedAt?: string;
  createdAt: string;
}

export interface CreateRedeemSessionRequest {
  rewardId: number;
  clientRequestId: string;
}

export interface RedeemSessionResponse {
  id: number;
  sessionToken: string;
  rewardId: number;
  rewardName: string;
  storeName: string;
  completed: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface StepUpOtpRequest {
  otpCode: string;
}

export const redemptionApi = {
  getMyRewards: async (): Promise<RewardInstanceResponse[]> => {
    const response = await apiClient.get('/api/redemption/rewards');
    return response.data;
  },

  createRedeemSession: async (data: CreateRedeemSessionRequest): Promise<RedeemSessionResponse> => {
    const response = await apiClient.post('/api/redemption/sessions', data);
    return response.data;
  },

  completeRedemption: async (sessionToken: string): Promise<RedeemSessionResponse> => {
    const response = await apiClient.post(`/api/redemption/sessions/${sessionToken}/complete`);
    return response.data;
  },

  verifyStepUpOtp: async (otpCode: string): Promise<void> => {
    await apiClient.post('/api/wallet/otp/step-up', { otpCode });
  },

  sendOtpForStepUp: async (phoneNumber: string): Promise<{ devOtpCode?: string }> => {
    const response = await apiClient.post('/api/wallet/otp/send', { phoneNumber });
    return response.data;
  },
};
