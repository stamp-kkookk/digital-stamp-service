/**
 * StampCard API Service for KKOOKK Owner
 */

import { apiClient, getRaw, patchRaw, delRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  CreateStampCardRequest,
  UpdateStampCardRequest,
  StampCardResponse,
  StampCardListResponse,
  StampCardStatusUpdateRequest,
  StampCardStatus,
} from '@/types/api';

// =============================================================================
// Multipart Helper
// =============================================================================

function buildStampCardFormData(
  data: CreateStampCardRequest | UpdateStampCardRequest,
  backgroundImage?: File,
  stampImage?: File
): FormData {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (backgroundImage) {
    formData.append('backgroundImage', backgroundImage);
  }
  if (stampImage) {
    formData.append('stampImage', stampImage);
  }
  return formData;
}

// =============================================================================
// StampCard CRUD Operations
// =============================================================================

export interface GetStampCardsParams {
  storeId: number;
  status?: StampCardStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getStampCards(
  params: GetStampCardsParams
): Promise<StampCardListResponse> {
  return getRaw<StampCardListResponse>(
    API_ENDPOINTS.OWNER.STAMP_CARDS(params.storeId),
    {
      status: params.status,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? 'createdAt,desc',
    }
  );
}

export async function getStampCard(
  storeId: number,
  stampCardId: number
): Promise<StampCardResponse> {
  return getRaw<StampCardResponse>(
    API_ENDPOINTS.OWNER.STAMP_CARD(storeId, stampCardId)
  );
}

export async function createStampCard(
  storeId: number,
  data: CreateStampCardRequest,
  backgroundImage?: File,
  stampImage?: File
): Promise<StampCardResponse> {
  const formData = buildStampCardFormData(data, backgroundImage, stampImage);
  const response = await apiClient.post<StampCardResponse>(
    API_ENDPOINTS.OWNER.STAMP_CARDS(storeId),
    formData
  );
  return response.data;
}

export async function updateStampCard(
  storeId: number,
  stampCardId: number,
  data: UpdateStampCardRequest,
  backgroundImage?: File,
  stampImage?: File
): Promise<StampCardResponse> {
  const formData = buildStampCardFormData(data, backgroundImage, stampImage);
  const response = await apiClient.put<StampCardResponse>(
    API_ENDPOINTS.OWNER.STAMP_CARD(storeId, stampCardId),
    formData
  );
  return response.data;
}

export async function updateStampCardStatus(
  storeId: number,
  stampCardId: number,
  status: StampCardStatus
): Promise<StampCardResponse> {
  return patchRaw<StampCardResponse, StampCardStatusUpdateRequest>(
    API_ENDPOINTS.OWNER.STAMP_CARD_STATUS(storeId, stampCardId),
    { status }
  );
}

export async function deleteStampCard(
  storeId: number,
  stampCardId: number
): Promise<void> {
  return delRaw<void>(API_ENDPOINTS.OWNER.STAMP_CARD(storeId, stampCardId));
}
