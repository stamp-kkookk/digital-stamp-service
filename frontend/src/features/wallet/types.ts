/**
 * Wallet Feature Types
 */

import type { StampCard, Reward } from '@/types/domain';

export interface WalletState {
  cards: StampCard[];
  rewards: Reward[];
  activeCardIndex: number;
  isLoading: boolean;
  error: string | null;
}

export interface WalletCardDisplayProps {
  card: StampCard;
  isActive: boolean;
  onClick: () => void;
}

export type CustomerScreen =
  | 'landing'
  | 'login'
  | 'signup'
  | 'signupSuccess'
  | 'wallet'
  | 'detail'
  | 'request'
  | 'requesting'
  | 'success'
  | 'rejected'
  | 'rewardBox'
  | 'redeem'
  | 'redeemResult'
  | 'history'
  | 'settings'
  | 'migrationList'
  | 'migrationForm';
