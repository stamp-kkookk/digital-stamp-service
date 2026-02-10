/**
 * StampCard API Service for KKOOKK Owner
 */

import { getRaw, postRaw, putRaw, patchRaw, delRaw } from '@/lib/api/client';
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
  data: CreateStampCardRequest
): Promise<StampCardResponse> {
  return postRaw<StampCardResponse, CreateStampCardRequest>(
    API_ENDPOINTS.OWNER.STAMP_CARDS(storeId),
    data
  );
}

export async function updateStampCard(
  storeId: number,
  stampCardId: number,
  data: UpdateStampCardRequest
): Promise<StampCardResponse> {
  return putRaw<StampCardResponse, UpdateStampCardRequest>(
    API_ENDPOINTS.OWNER.STAMP_CARD(storeId, stampCardId),
    data
  );
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
