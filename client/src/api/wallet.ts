import { apiClient } from './client';

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  devOtpCode?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface RegisterWalletRequest {
  phoneNumber: string;
  otpCode: string;
  name: string;
  nickname?: string;
}

export interface AccessWalletRequest {
  phoneNumber: string;
  name: string;
}

export interface WalletResponse {
  walletId: number;
  phoneNumber: string;
  name: string;
  nickname: string;
  sessionToken: string;
  sessionScope: string;
}

export interface WalletStampCardResponse {
  id: number;
  storeId: number;
  storeName: string;
  storeAddress?: string;
  stampCardId: number;
  stampCardTitle: string;
  stampCardDescription?: string;
  stampGoal: number;
  rewardName?: string;
  rewardExpiresInDays?: number;
  themeColor?: string;
  stampCount: number;
  updatedAt: string;
}

export const walletApi = {
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiClient.post('/api/wallet/otp/send', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiClient.post('/api/wallet/otp/verify', data);
    return response.data;
  },

  register: async (data: RegisterWalletRequest): Promise<WalletResponse> => {
    const response = await apiClient.post('/api/wallet/register', data);
    return response.data;
  },

  access: async (data: AccessWalletRequest): Promise<WalletResponse> => {
    const response = await apiClient.post('/api/wallet/access', data);
    return response.data;
  },

  getMyStampCards: async (): Promise<WalletStampCardResponse[]> => {
    const response = await apiClient.get('/api/wallet/stamp-cards');
    return response.data;
  },
};
