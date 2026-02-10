/**
 * Wallet API Service for KKOOKK Customer
 */

import { getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  WalletStampCardListResponse,
  StampHistoryResponse,
  RedeemHistoryResponse,
  WalletRewardListResponse,
  StoreSummaryResponse,
  WalletRewardStatus,
} from '@/types/api';

// =============================================================================
// Store Summary
// =============================================================================

export async function getStoreSummary(storeId: number): Promise<StoreSummaryResponse> {
  return getRaw<StoreSummaryResponse>(API_ENDPOINTS.CUSTOMER.STORE_SUMMARY(storeId));
}

// =============================================================================
// Wallet Stamp Cards
// =============================================================================

export async function getWalletStampCards(
  storeId: number
): Promise<WalletStampCardListResponse> {
  return getRaw<WalletStampCardListResponse>(API_ENDPOINTS.CUSTOMER.WALLET_STAMP_CARDS, {
    storeId,
  });
}

// =============================================================================
// Stamp History (StepUp Required)
// =============================================================================

export interface GetStampHistoryParams {
  storeId: number;
  page?: number;
  size?: number;
}

export async function getStampHistory(
  params: GetStampHistoryParams
): Promise<StampHistoryResponse> {
  return getRaw<StampHistoryResponse>(
    API_ENDPOINTS.CUSTOMER.STAMP_HISTORY(params.storeId),
    {
      page: params.page ?? 0,
      size: params.size ?? 20,
    }
  );
}

// =============================================================================
// Redeem History (StepUp Required)
// =============================================================================

export interface GetRedeemHistoryParams {
  storeId: number;
  page?: number;
  size?: number;
}

export async function getRedeemHistory(
  params: GetRedeemHistoryParams
): Promise<RedeemHistoryResponse> {
  return getRaw<RedeemHistoryResponse>(
    API_ENDPOINTS.CUSTOMER.REDEEM_HISTORY(params.storeId),
    {
      page: params.page ?? 0,
      size: params.size ?? 20,
    }
  );
}

// =============================================================================
// Wallet Rewards (StepUp Required)
// =============================================================================

export interface GetWalletRewardsParams {
  status?: WalletRewardStatus;
  page?: number;
  size?: number;
}

export async function getWalletRewards(
  params?: GetWalletRewardsParams
): Promise<WalletRewardListResponse> {
  return getRaw<WalletRewardListResponse>(API_ENDPOINTS.CUSTOMER.WALLET_REWARDS, {
    status: params?.status,
    page: params?.page ?? 0,
    size: params?.size ?? 20,
  });
}
