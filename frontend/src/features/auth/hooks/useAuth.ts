/**
 * Auth Hooks for KKOOKK
 * TanStack Query hooks for authentication operations
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  requestOtp,
  verifyOtp,
  registerWallet,
  loginWallet,
  ownerSignup,
  ownerLogin,
  getStorePublicInfo,
} from '../api/authApi';
import {
  setAuthToken,
  setStepUpToken,
  setUserInfo,
  clearAuthToken,
} from '@/lib/api/tokenManager';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type {
  OtpRequestDto,
  OtpVerifyDto,
  WalletRegisterRequest,
  WalletLoginRequest,
  OwnerSignupRequest,
  OwnerLoginRequest,
} from '@/types/api';

// =============================================================================
// OTP Hooks
// =============================================================================

export function useOtpRequest() {
  return useMutation({
    mutationFn: (data: OtpRequestDto) => requestOtp(data),
  });
}

export function useOtpVerify() {
  return useMutation({
    mutationFn: (data: OtpVerifyDto) => verifyOtp(data),
    onSuccess: (response) => {
      // Store StepUp token if verification successful
      if (response.verified && response.stepUpToken) {
        setStepUpToken(response.stepUpToken);
      }
    },
  });
}

// =============================================================================
// Wallet Registration Hook
// =============================================================================

export function useWalletRegister() {
  return useMutation({
    mutationFn: (data: WalletRegisterRequest) => registerWallet(data),
    onSuccess: (response) => {
      // Store customer token and user info
      setAuthToken(response.accessToken, 'customer');
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
      setAuthToken(response.accessToken, 'customer');
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
// Owner Auth Hooks
// =============================================================================

export function useOwnerSignup() {
  return useMutation({
    mutationFn: (data: OwnerSignupRequest) => ownerSignup(data),
  });
}

export function useOwnerLogin() {
  return useMutation({
    mutationFn: (data: OwnerLoginRequest) => ownerLogin(data),
    onSuccess: (response) => {
      // Store owner token and user info
      setAuthToken(response.accessToken, 'owner');
      setUserInfo({
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phoneNumber,
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
