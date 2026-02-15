/**
 * Redemption API Service for KKOOKK Customer
 * StepUp token required for all operations
 */

import { postRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { RedeemRewardRequest, RedeemRewardResponse } from '@/types/api';

// =============================================================================
// Redeem Reward (StepUp Required)
// =============================================================================

export async function redeemReward(
  data: RedeemRewardRequest
): Promise<RedeemRewardResponse> {
  return postRaw<RedeemRewardResponse, RedeemRewardRequest>(
    API_ENDPOINTS.CUSTOMER.REDEEMS,
    data
  );
}
