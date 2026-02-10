/**
 * Terminal API Service for KKOOKK
 * Handles issuance approval and redeem session viewing
 */

import { getRaw, postRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  TerminalLoginRequest,
  TerminalLoginResponse,
  PendingIssuanceRequestListResponse,
  IssuanceApprovalResponse,
  IssuanceRejectionResponse,
  PendingRedeemSessionListResponse,
  StampEventResponse,
  PageResponse,
} from '@/types/api';

// =============================================================================
// Terminal Auth
// =============================================================================

export async function terminalLogin(
  data: TerminalLoginRequest
): Promise<TerminalLoginResponse> {
  return postRaw<TerminalLoginResponse, TerminalLoginRequest>(
    API_ENDPOINTS.TERMINAL.LOGIN,
    data
  );
}

// =============================================================================
// Issuance Requests
// =============================================================================

export async function getPendingIssuanceRequests(
  storeId: number
): Promise<PendingIssuanceRequestListResponse> {
  return getRaw<PendingIssuanceRequestListResponse>(
    API_ENDPOINTS.TERMINAL.ISSUANCE_REQUESTS(storeId)
  );
}

export async function approveIssuanceRequest(
  storeId: number,
  requestId: number
): Promise<IssuanceApprovalResponse> {
  return postRaw<IssuanceApprovalResponse>(
    API_ENDPOINTS.TERMINAL.APPROVE_ISSUANCE(storeId, requestId)
  );
}

export async function rejectIssuanceRequest(
  storeId: number,
  requestId: number
): Promise<IssuanceRejectionResponse> {
  return postRaw<IssuanceRejectionResponse>(
    API_ENDPOINTS.TERMINAL.REJECT_ISSUANCE(storeId, requestId)
  );
}

// =============================================================================
// Redeem Sessions
// =============================================================================

export async function getPendingRedeemSessions(
  storeId: number
): Promise<PendingRedeemSessionListResponse> {
  return getRaw<PendingRedeemSessionListResponse>(
    API_ENDPOINTS.TERMINAL.REDEEM_SESSIONS(storeId)
  );
}

// =============================================================================
// Terminal Stamp Events (Terminal JWT)
// =============================================================================

export async function getTerminalStampEvents(
  storeId: number,
  page = 0,
  size = 20
): Promise<PageResponse<StampEventResponse>> {
  return getRaw<PageResponse<StampEventResponse>>(
    API_ENDPOINTS.TERMINAL.STAMP_EVENTS(storeId),
    { page, size }
  );
}
