/**
 * Terminal Hooks for KKOOKK
 * TanStack Query hooks for terminal operations with polling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  terminalLogin,
  getPendingIssuanceRequests,
  approveIssuanceRequest,
  rejectIssuanceRequest,
  getPendingRedeemSessions,
  getTerminalStampEvents,
} from '../api/terminalApi';
import { setAuthToken, setUserInfo } from '@/lib/api/tokenManager';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type { TerminalLoginRequest } from '@/types/api';

// =============================================================================
// Terminal Login Hook
// =============================================================================

export function useTerminalLogin() {
  return useMutation({
    mutationFn: (data: TerminalLoginRequest) => terminalLogin(data),
    onSuccess: (response) => {
      setAuthToken(response.accessToken, 'terminal');
      setUserInfo({
        id: response.ownerId,
        name: response.storeName,
      });
    },
  });
}

// =============================================================================
// Polling Configuration
// =============================================================================

const POLLING_INTERVAL_MS = 2000; // 2 seconds

// =============================================================================
// Pending Issuance Requests Hook (with Polling)
// =============================================================================

export function usePendingIssuanceRequests(
  storeId: number | undefined,
  options?: {
    enabled?: boolean;
    pollingEnabled?: boolean;
  }
) {
  const enabled = options?.enabled ?? true;
  const pollingEnabled = options?.pollingEnabled ?? true;

  return useQuery({
    queryKey: QUERY_KEYS.pendingIssuanceRequests(storeId ?? 0),
    queryFn: () => getPendingIssuanceRequests(storeId!),
    enabled: !!storeId && enabled,
    refetchInterval: (query) => {
      // 403/401 에러 시 폴링 중단
      if (query.state.error) {
        const err = query.state.error as { response?: { status?: number } };
        if (err.response?.status === 403 || err.response?.status === 401) {
          return false;
        }
      }
      return pollingEnabled ? POLLING_INTERVAL_MS : false;
    },
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 403 || err.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// =============================================================================
// Approve Issuance Hook
// =============================================================================

export function useApproveIssuance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      requestId,
    }: {
      storeId: number;
      requestId: number;
    }) => approveIssuanceRequest(storeId, requestId),
    onSuccess: (_, { storeId }) => {
      // Invalidate pending requests to refresh list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingIssuanceRequests(storeId),
      });
    },
  });
}

// =============================================================================
// Reject Issuance Hook
// =============================================================================

export function useRejectIssuance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      requestId,
    }: {
      storeId: number;
      requestId: number;
    }) => rejectIssuanceRequest(storeId, requestId),
    onSuccess: (_, { storeId }) => {
      // Invalidate pending requests to refresh list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingIssuanceRequests(storeId),
      });
    },
  });
}

// =============================================================================
// Pending Redeem Sessions Hook (with Polling)
// =============================================================================

export function usePendingRedeemSessions(
  storeId: number | undefined,
  options?: {
    enabled?: boolean;
    pollingEnabled?: boolean;
  }
) {
  const enabled = options?.enabled ?? true;
  const pollingEnabled = options?.pollingEnabled ?? true;

  return useQuery({
    queryKey: QUERY_KEYS.pendingRedeemSessions(storeId ?? 0),
    queryFn: () => getPendingRedeemSessions(storeId!),
    enabled: !!storeId && enabled,
    refetchInterval: (query) => {
      if (query.state.error) {
        const err = query.state.error as { response?: { status?: number } };
        if (err.response?.status === 403 || err.response?.status === 401) {
          return false;
        }
      }
      return pollingEnabled ? POLLING_INTERVAL_MS : false;
    },
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 403 || err.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// =============================================================================
// Terminal Stamp Events Hook
// =============================================================================

export function useTerminalStampEvents(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.storeStampEvents(storeId ?? 0),
    queryFn: () => getTerminalStampEvents(storeId!),
    enabled: !!storeId,
  });
}
