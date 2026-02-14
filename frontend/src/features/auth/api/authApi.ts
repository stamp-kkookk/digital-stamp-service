/**
 * Auth API Service for KKOOKK
 * Handles OTP, wallet registration, and owner auth
 */

import { postRaw, getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  OtpRequestDto,
  OtpRequestResponse,
  OtpVerifyDto,
  OtpVerifyResponse,
  NicknameCheckResponse,
  PhoneCheckResponse,
  WalletRegisterRequest,
  WalletRegisterResponse,
  WalletLoginRequest,
  WalletLoginResponse,
  OwnerSignupRequest,
  OwnerSignupResponse,
  OwnerLoginRequest,
  OwnerLoginResponse,
  StorePublicInfoResponse,
} from '@/types/api';

// =============================================================================
// Public API - OTP
// =============================================================================

export async function requestOtp(data: OtpRequestDto): Promise<OtpRequestResponse> {
  return postRaw<OtpRequestResponse, OtpRequestDto>(
    API_ENDPOINTS.PUBLIC.OTP_REQUEST,
    data
  );
}

export async function verifyOtp(data: OtpVerifyDto): Promise<OtpVerifyResponse> {
  return postRaw<OtpVerifyResponse, OtpVerifyDto>(
    API_ENDPOINTS.PUBLIC.OTP_VERIFY,
    data
  );
}

// =============================================================================
// Public API - Nickname Check
// =============================================================================

export async function checkNickname(nickname: string): Promise<NicknameCheckResponse> {
  return getRaw<NicknameCheckResponse>(
    API_ENDPOINTS.PUBLIC.CHECK_NICKNAME,
    { nickname }
  );
}

export async function checkPhone(phone: string): Promise<PhoneCheckResponse> {
  return getRaw<PhoneCheckResponse>(
    API_ENDPOINTS.PUBLIC.CHECK_PHONE,
    { phone }
  );
}

// =============================================================================
// Public API - Wallet
// =============================================================================

export async function registerWallet(
  data: WalletRegisterRequest
): Promise<WalletRegisterResponse> {
  return postRaw<WalletRegisterResponse, WalletRegisterRequest>(
    API_ENDPOINTS.PUBLIC.WALLET_REGISTER,
    data
  );
}

export async function loginWallet(
  data: WalletLoginRequest
): Promise<WalletLoginResponse> {
  return postRaw<WalletLoginResponse, WalletLoginRequest>(
    API_ENDPOINTS.PUBLIC.WALLET_LOGIN,
    data
  );
}

// =============================================================================
// Public API - Store Info
// =============================================================================

export async function getStorePublicInfo(
  storeId: number
): Promise<StorePublicInfoResponse> {
  return getRaw<StorePublicInfoResponse>(API_ENDPOINTS.PUBLIC.STORE_INFO(storeId));
}

export async function getPublicStores(): Promise<StorePublicInfoResponse[]> {
  return getRaw<StorePublicInfoResponse[]>(API_ENDPOINTS.PUBLIC.STORES);
}

// =============================================================================
// Owner API - Auth
// =============================================================================

export async function ownerSignup(
  data: OwnerSignupRequest
): Promise<OwnerSignupResponse> {
  return postRaw<OwnerSignupResponse, OwnerSignupRequest>(
    API_ENDPOINTS.OWNER.SIGNUP,
    data
  );
}

export async function ownerLogin(
  data: OwnerLoginRequest
): Promise<OwnerLoginResponse> {
  return postRaw<OwnerLoginResponse, OwnerLoginRequest>(
    API_ENDPOINTS.OWNER.LOGIN,
    data
  );
}
