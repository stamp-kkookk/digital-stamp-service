/**
 * Auth API Service for KKOOKK
 * Handles wallet registration and store info
 */

import { postRaw, getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  NicknameCheckResponse,
  PhoneCheckResponse,
  WalletRegisterRequest,
  WalletRegisterResponse,
  WalletLoginRequest,
  WalletLoginResponse,
  StorePublicInfoResponse,
} from '@/types/api';

// =============================================================================
// Public API - Nickname / Phone Check
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
