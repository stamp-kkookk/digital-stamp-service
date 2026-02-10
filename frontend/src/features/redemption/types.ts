/**
 * Redemption Feature Types
 */

import type { Reward, RedeemSessionStatus } from '@/types/domain';

export interface RedemptionState {
  selectedReward: Reward | null;
  sessionId: string | null;
  status: RedeemSessionStatus | null;
  remainingSeconds: number;
  showStaffConfirm: boolean;
  error: string | null;
}

export type RedeemResult = 'success' | 'fail' | 'expired';

export interface RedeemSessionData {
  rewardId: string;
  walletId: string;
  storeId: string;
}

export const REDEEM_TTL_SECONDS = 60; // 30-60 seconds per PRD
