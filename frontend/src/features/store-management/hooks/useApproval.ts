/**
 * Owner Approval Hooks
 * TanStack Query hooks for owner issuance approval with polling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOwnerPendingIssuanceRequests,
  ownerApproveIssuanceRequest,
  ownerRejectIssuanceRequest,
} from '../api/approvalApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';

const POLLING_INTERVAL_MS = 2000;

export function useOwnerPendingIssuanceRequests(
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
    queryFn: () => getOwnerPendingIssuanceRequests(storeId!),
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

export function useOwnerApproveIssuance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      requestId,
    }: {
      storeId: number;
      requestId: number;
    }) => ownerApproveIssuanceRequest(storeId, requestId),
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingIssuanceRequests(storeId),
      });
    },
  });
}

export function useOwnerRejectIssuance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      requestId,
    }: {
      storeId: number;
      requestId: number;
    }) => ownerRejectIssuanceRequest(storeId, requestId),
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.pendingIssuanceRequests(storeId),
      });
    },
  });
}
