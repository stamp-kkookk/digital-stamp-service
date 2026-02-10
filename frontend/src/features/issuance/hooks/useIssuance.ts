/**
 * Issuance Hooks for KKOOKK Customer
 * TanStack Query hooks for stamp issuance operations with polling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createIssuanceRequest, getIssuanceRequest } from '../api/issuanceApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type { CreateIssuanceRequest } from '@/types/api';

// =============================================================================
// Polling Configuration
// =============================================================================

const POLLING_INTERVAL_MS = 2000; // 2 seconds

// =============================================================================
// Create Issuance Request Hook
// =============================================================================

export function useCreateIssuanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssuanceRequest) => createIssuanceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

// =============================================================================
// Issuance Request Status Hook (with Polling)
// =============================================================================

export function useIssuanceRequestStatus(
  requestId: number | undefined,
  enabled: boolean
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.issuanceRequest(requestId ?? 0),
    queryFn: () => getIssuanceRequest(requestId!),
    enabled: !!requestId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'PENDING' && data.remainingSeconds > 0) {
        return POLLING_INTERVAL_MS;
      }

      if (data?.status === 'APPROVED') {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }

      return false;
    },
  });
}

// =============================================================================
// Generate Idempotency Key
// =============================================================================

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
