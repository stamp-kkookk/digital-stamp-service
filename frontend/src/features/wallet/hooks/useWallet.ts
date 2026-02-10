/**
 * Wallet Hooks for KKOOKK Customer
 * TanStack Query hooks for wallet operations
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getStoreSummary,
  getWalletStampCards,
  getStampHistory,
  getRedeemHistory,
  getWalletRewards,
  type GetStampHistoryParams,
  type GetRedeemHistoryParams,
  type GetWalletRewardsParams,
} from '../api/walletApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { isStepUpValid } from '@/lib/api/tokenManager';

// =============================================================================
// Store Summary Hook
// =============================================================================

export function useStoreSummary(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.storeSummary(storeId!),
    queryFn: () => getStoreSummary(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Wallet Stamp Cards Hook
// =============================================================================

export function useWalletStampCards(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.walletStampCards(storeId!),
    queryFn: () => getWalletStampCards(storeId!),
    enabled: !!storeId,
    refetchOnMount: 'always',
  });
}

// =============================================================================
// Stamp History Hook (StepUp Required)
// =============================================================================

export function useStampHistory(
  storeId: number | undefined,
  options?: Omit<GetStampHistoryParams, 'storeId'>
) {
  return useQuery({
    queryKey: QUERY_KEYS.stampHistory(storeId ?? 0),
    queryFn: () =>
      getStampHistory({
        storeId: storeId!,
        page: options?.page,
        size: options?.size,
      }),
    enabled: !!storeId && isStepUpValid(),
    refetchOnMount: 'always',
  });
}

export function useStampHistoryInfinite(
  storeId: number | undefined,
  pageSize = 20
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.stampHistory(storeId ?? 0), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      getStampHistory({
        storeId: storeId!,
        page: pageParam,
        size: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      const { pageInfo } = lastPage;
      if (pageInfo.pageNumber < pageInfo.totalPages - 1) {
        return pageInfo.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!storeId && isStepUpValid(),
  });
}

// =============================================================================
// Redeem History Hook (StepUp Required)
// =============================================================================

export function useRedeemHistory(
  storeId: number | undefined,
  options?: Omit<GetRedeemHistoryParams, 'storeId'>
) {
  return useQuery({
    queryKey: QUERY_KEYS.redeemHistory(storeId ?? 0),
    queryFn: () =>
      getRedeemHistory({
        storeId: storeId!,
        page: options?.page,
        size: options?.size,
      }),
    enabled: !!storeId && isStepUpValid(),
    refetchOnMount: 'always',
  });
}

export function useRedeemHistoryInfinite(
  storeId: number | undefined,
  pageSize = 20
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.redeemHistory(storeId ?? 0), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      getRedeemHistory({
        storeId: storeId!,
        page: pageParam,
        size: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      const { pageInfo } = lastPage;
      if (pageInfo.number < pageInfo.totalPages - 1) {
        return pageInfo.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!storeId && isStepUpValid(),
  });
}

// =============================================================================
// Wallet Rewards Hook (StepUp Required)
// =============================================================================

export function useWalletRewards(options?: GetWalletRewardsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.walletRewards(options?.status),
    queryFn: () => getWalletRewards(options),
    enabled: isStepUpValid(),
  });
}

export function useWalletRewardsInfinite(
  status?: GetWalletRewardsParams['status'],
  pageSize = 20
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.walletRewards(status), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      getWalletRewards({
        status,
        page: pageParam,
        size: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      const { pageInfo } = lastPage;
      if (pageInfo.number < pageInfo.totalPages - 1) {
        return pageInfo.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: isStepUpValid(),
  });
}
