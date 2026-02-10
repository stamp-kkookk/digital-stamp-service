/**
 * StampCard Hooks for KKOOKK Owner
 * TanStack Query hooks for stamp card operations
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getStampCards,
  getStampCard,
  createStampCard,
  updateStampCard,
  updateStampCardStatus,
  deleteStampCard,
  type GetStampCardsParams,
} from '../api/stampCardApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type {
  CreateStampCardRequest,
  UpdateStampCardRequest,
  StampCardStatus,
} from '@/types/api';

// =============================================================================
// StampCard List Hook
// =============================================================================

export function useStampCards(
  params: Omit<GetStampCardsParams, 'storeId'> & { storeId?: number }
) {
  return useQuery({
    queryKey: QUERY_KEYS.stampCards(params.storeId ?? 0, params.status),
    queryFn: () =>
      getStampCards({
        storeId: params.storeId!,
        status: params.status,
        page: params.page,
        size: params.size,
        sort: params.sort,
      }),
    enabled: !!params.storeId,
  });
}

export function useStampCardsInfinite(
  storeId: number | undefined,
  status?: StampCardStatus,
  pageSize = 20
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.stampCards(storeId ?? 0, status), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      getStampCards({
        storeId: storeId!,
        status,
        page: pageParam,
        size: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      const { page } = lastPage;
      if (page.number < page.totalPages - 1) {
        return page.number + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!storeId,
  });
}

// =============================================================================
// Single StampCard Hook
// =============================================================================

export function useStampCard(storeId: number | undefined, stampCardId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.stampCard(storeId ?? 0, stampCardId ?? 0),
    queryFn: () => getStampCard(storeId!, stampCardId!),
    enabled: !!storeId && !!stampCardId,
  });
}

// =============================================================================
// Create StampCard Hook
// =============================================================================

export function useCreateStampCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: number;
      data: CreateStampCardRequest;
    }) => createStampCard(storeId, data),
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stampCards(storeId, undefined),
      });
    },
  });
}

// =============================================================================
// Update StampCard Hook
// =============================================================================

export function useUpdateStampCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      stampCardId,
      data,
    }: {
      storeId: number;
      stampCardId: number;
      data: UpdateStampCardRequest;
    }) => updateStampCard(storeId, stampCardId, data),
    onSuccess: (_, { storeId, stampCardId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stampCards(storeId, undefined),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stampCard(storeId, stampCardId),
      });
    },
  });
}

// =============================================================================
// Update StampCard Status Hook
// =============================================================================

export function useUpdateStampCardStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      stampCardId,
      status,
    }: {
      storeId: number;
      stampCardId: number;
      status: StampCardStatus;
    }) => updateStampCardStatus(storeId, stampCardId, status),
    onSuccess: (_, { storeId, stampCardId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stampCards(storeId, undefined),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stampCard(storeId, stampCardId),
      });
    },
  });
}

// =============================================================================
// Delete StampCard Hook
// =============================================================================

export function useDeleteStampCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      stampCardId,
    }: {
      storeId: number;
      stampCardId: number;
    }) => deleteStampCard(storeId, stampCardId),
    onSuccess: (_, { storeId, stampCardId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stampCards(storeId, undefined),
      });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.stampCard(storeId, stampCardId),
      });
    },
  });
}
