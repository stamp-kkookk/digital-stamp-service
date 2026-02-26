/**
 * Store Management API Service for KKOOKK Owner
 */

import { apiClient, getRaw, delRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  StoreCreateRequest,
  StoreUpdateRequest,
  StoreResponse,
  QrCodeResponse,
  StoreStatisticsResponse,
  StampEventResponse,
  RedeemEventResponse,
  PageResponse,
} from '@/types/api';

// =============================================================================
// Multipart Helper
// =============================================================================

function buildStoreFormData(data: StoreCreateRequest | StoreUpdateRequest, iconFile?: File): FormData {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (iconFile) {
    formData.append('icon', iconFile);
  }
  return formData;
}

// =============================================================================
// Store CRUD Operations
// =============================================================================

export async function getStores(): Promise<StoreResponse[]> {
  return getRaw<StoreResponse[]>(API_ENDPOINTS.OWNER.STORES);
}

export async function getStore(storeId: number): Promise<StoreResponse> {
  return getRaw<StoreResponse>(API_ENDPOINTS.OWNER.STORE(storeId));
}

export async function createStore(
  data: StoreCreateRequest,
  iconFile?: File
): Promise<StoreResponse> {
  const formData = buildStoreFormData(data, iconFile);
  const response = await apiClient.post<StoreResponse>(API_ENDPOINTS.OWNER.STORES, formData);
  return response.data;
}

export async function updateStore(
  storeId: number,
  data: StoreUpdateRequest,
  iconFile?: File
): Promise<StoreResponse> {
  const formData = buildStoreFormData(data, iconFile);
  const response = await apiClient.put<StoreResponse>(API_ENDPOINTS.OWNER.STORE(storeId), formData);
  return response.data;
}

export async function deleteStore(storeId: number): Promise<void> {
  return delRaw<void>(API_ENDPOINTS.OWNER.STORE(storeId));
}

// =============================================================================
// Store QR Code
// =============================================================================

export async function getStoreQR(storeId: number): Promise<QrCodeResponse> {
  return getRaw<QrCodeResponse>(API_ENDPOINTS.OWNER.STORE_QR(storeId));
}

// =============================================================================
// Store Statistics
// =============================================================================

export interface GetStoreStatisticsParams {
  storeId: number;
  startDate?: string;
  endDate?: string;
}

export async function getStoreStatistics(
  params: GetStoreStatisticsParams
): Promise<StoreStatisticsResponse> {
  return getRaw<StoreStatisticsResponse>(
    API_ENDPOINTS.OWNER.STORE_STATISTICS(params.storeId),
    {
      startDate: params.startDate,
      endDate: params.endDate,
    }
  );
}

// =============================================================================
// Stamp Events
// =============================================================================

export interface GetStampEventsParams {
  storeId: number;
  page?: number;
  size?: number;
}

export async function getStampEvents(
  params: GetStampEventsParams
): Promise<PageResponse<StampEventResponse>> {
  return getRaw<PageResponse<StampEventResponse>>(
    API_ENDPOINTS.OWNER.STORE_STAMP_EVENTS(params.storeId),
    {
      page: params.page ?? 0,
      size: params.size ?? 20,
    }
  );
}

// =============================================================================
// Redeem Events
// =============================================================================

export interface GetRedeemEventsParams {
  storeId: number;
  page?: number;
  size?: number;
}

export async function getRedeemEvents(
  params: GetRedeemEventsParams
): Promise<PageResponse<RedeemEventResponse>> {
  return getRaw<PageResponse<RedeemEventResponse>>(
    API_ENDPOINTS.OWNER.STORE_REDEEM_EVENTS(params.storeId),
    {
      page: params.page ?? 0,
      size: params.size ?? 20,
    }
  );
}
