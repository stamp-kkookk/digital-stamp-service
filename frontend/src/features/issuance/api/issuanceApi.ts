/**
 * Issuance API Service for KKOOKK Customer
 */

import { postRaw, getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  CreateIssuanceRequest,
  IssuanceRequestResponse,
} from '@/types/api';

// =============================================================================
// Create Issuance Request
// =============================================================================

export async function createIssuanceRequest(
  data: CreateIssuanceRequest
): Promise<IssuanceRequestResponse> {
  return postRaw<IssuanceRequestResponse, CreateIssuanceRequest>(
    API_ENDPOINTS.CUSTOMER.ISSUANCE_REQUESTS,
    data
  );
}

// =============================================================================
// Get Issuance Request Status (for polling)
// =============================================================================

export async function getIssuanceRequest(
  requestId: number
): Promise<IssuanceRequestResponse> {
  return getRaw<IssuanceRequestResponse>(
    API_ENDPOINTS.CUSTOMER.ISSUANCE_REQUEST(requestId)
  );
}
