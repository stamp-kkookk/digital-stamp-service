/**
 * Redemption Hooks for KKOOKK Customer
 * TanStack Query hooks for reward redemption operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRedeemSession, completeRedeemSession } from '../api/redeemApi';
import type { CreateRedeemSessionRequest } from '@/types/api';

// =============================================================================
// Create Redeem Session Hook (StepUp Required)
// =============================================================================

export function useCreateRedeemSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRedeemSessionRequest) => createRedeemSession(data),
    onSuccess: () => {
      // Invalidate wallet rewards to reflect status change
      queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] });
    },
  });
}

// =============================================================================
// Complete Redeem Session Hook
// =============================================================================

export function useCompleteRedeemSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => completeRedeemSession(sessionId),
    onSuccess: () => {
      // Invalidate wallet rewards and redeem history
      queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'redeemHistory'] });
    },
  });
}
