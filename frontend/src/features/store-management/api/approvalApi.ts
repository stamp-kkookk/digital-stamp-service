/**
 * Owner Approval API Service
 * Handles issuance approval operations from Owner backoffice
 */

import { getRaw, postRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  PendingIssuanceRequestListResponse,
  IssuanceApprovalResponse,
  IssuanceRejectionResponse,
} from '@/types/api';

export async function getOwnerPendingIssuanceRequests(
  storeId: number
): Promise<PendingIssuanceRequestListResponse> {
  return getRaw<PendingIssuanceRequestListResponse>(
    API_ENDPOINTS.OWNER.ISSUANCE_REQUESTS(storeId)
  );
}

export async function ownerApproveIssuanceRequest(
  storeId: number,
  requestId: number
): Promise<IssuanceApprovalResponse> {
  return postRaw<IssuanceApprovalResponse>(
    API_ENDPOINTS.OWNER.APPROVE_ISSUANCE(storeId, requestId)
  );
}

export async function ownerRejectIssuanceRequest(
  storeId: number,
  requestId: number
): Promise<IssuanceRejectionResponse> {
  return postRaw<IssuanceRejectionResponse>(
    API_ENDPOINTS.OWNER.REJECT_ISSUANCE(storeId, requestId)
  );
}
