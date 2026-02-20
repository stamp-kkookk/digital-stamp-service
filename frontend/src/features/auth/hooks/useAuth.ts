/**
 * Auth Hooks for KKOOKK
 * TanStack Query hooks for authentication operations
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  registerWallet,
  loginWallet,
  getStorePublicInfo,
} from '../api/authApi';
import {
  setAuthToken,
  setUserInfo,
  clearAuthToken,
} from '@/lib/api/tokenManager';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type {
  WalletRegisterRequest,
  WalletLoginRequest,
} from '@/types/api';

// =============================================================================
// Wallet Registration Hook
// =============================================================================

export function useWalletRegister() {
  return useMutation({
    mutationFn: (data: WalletRegisterRequest) => registerWallet(data),
    onSuccess: (response) => {
      // Store customer token and user info
      setAuthToken(response.accessToken, response.refreshToken, 'customer');
      setUserInfo({
        id: response.walletId,
        name: response.name,
        phone: response.phone,
        nickname: response.nickname,
      });
    },
  });
}

// =============================================================================
// Wallet Login Hook
// =============================================================================

export function useWalletLogin() {
  return useMutation({
    mutationFn: (data: WalletLoginRequest) => loginWallet(data),
    onSuccess: (response) => {
      setAuthToken(response.accessToken, response.refreshToken, 'customer');
      setUserInfo({
        id: response.walletId,
        name: response.name,
        phone: response.phone,
        nickname: response.nickname,
      });
    },
  });
}

// =============================================================================
// Store Public Info Hook
// =============================================================================

export function useStorePublicInfo(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.storePublicInfo(storeId ?? 0),
    queryFn: () => getStorePublicInfo(storeId!),
    enabled: !!storeId,
  });
}

// =============================================================================
// Logout Hook
// =============================================================================

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      clearAuthToken();
      return Promise.resolve();
    },
  });
}
