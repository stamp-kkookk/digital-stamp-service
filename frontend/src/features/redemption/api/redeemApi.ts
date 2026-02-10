/**
 * Redemption API Service for KKOOKK Customer
 * StepUp token required for all operations
 */

import { postRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  CreateRedeemSessionRequest,
  RedeemSessionResponse,
} from '@/types/api';

// =============================================================================
// Create Redeem Session (StepUp Required)
// =============================================================================

export async function createRedeemSession(
  data: CreateRedeemSessionRequest
): Promise<RedeemSessionResponse> {
  return postRaw<RedeemSessionResponse, CreateRedeemSessionRequest>(
    API_ENDPOINTS.CUSTOMER.REDEEM_SESSIONS,
    data
  );
}

// =============================================================================
// Complete Redeem Session
// =============================================================================

export async function completeRedeemSession(
  sessionId: number
): Promise<RedeemSessionResponse> {
  return postRaw<RedeemSessionResponse>(
    API_ENDPOINTS.CUSTOMER.REDEEM_SESSION_COMPLETE(sessionId)
  );
}
