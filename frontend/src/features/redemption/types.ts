/**
 * Redemption Feature Types
 */

import type { Reward } from '@/types/domain';

export interface RedemptionState {
  selectedReward: Reward | null;
  showStaffConfirm: boolean;
  error: string | null;
}

export type RedeemResult = 'success' | 'fail';
