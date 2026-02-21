/**
 * Redemption Hooks for KKOOKK Customer
 * TanStack Query hooks for reward redemption operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redeemReward } from '../api/redeemApi';
import type { RedeemRewardRequest } from '@/types/api';

// =============================================================================
// Redeem Reward Hook
// =============================================================================

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RedeemRewardRequest) => redeemReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'redeemHistory'] });
    },
  });
}
