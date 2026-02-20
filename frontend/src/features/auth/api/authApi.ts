/**
 * Auth API Service for KKOOKK
 * Handles nickname/phone checks and store info
 */

import { getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  NicknameCheckResponse,
  PhoneCheckResponse,
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
