/**
 * Owner Migration Hooks for KKOOKK
 * TanStack Query hooks for managing customer migration requests
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStoreMigrations,
  getStoreMigrationDetail,
  approveMigration,
  rejectMigration,
} from '../api/migrationApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type { MigrationApproveRequest, MigrationRejectRequest } from '@/types/api';

// =============================================================================
// Store Migrations List Hook
// =============================================================================

export function useStoreMigrations(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.storeMigrations(storeId ?? 0),
    queryFn: () => getStoreMigrations(storeId!),
    enabled: !!storeId,
  });
}

// =============================================================================
// Single Store Migration Hook
// =============================================================================

export function useStoreMigrationDetail(
  storeId: number | undefined,
  migrationId: number | undefined
) {
  return useQuery({
    queryKey: QUERY_KEYS.storeMigration(storeId ?? 0, migrationId ?? 0),
    queryFn: () => getStoreMigrationDetail(storeId!, migrationId!),
    enabled: !!storeId && !!migrationId,
  });
}

// =============================================================================
// Approve Migration Hook
// =============================================================================

export function useApproveMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      migrationId,
      data,
    }: {
      storeId: number;
      migrationId: number;
      data: MigrationApproveRequest;
    }) => approveMigration(storeId, migrationId, data),
    onSuccess: (_, { storeId, migrationId }) => {
      // Invalidate migration lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storeMigrations(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storeMigration(storeId, migrationId),
      });
    },
  });
}

// =============================================================================
// Reject Migration Hook
// =============================================================================

export function useRejectMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      migrationId,
      data,
    }: {
      storeId: number;
      migrationId: number;
      data: MigrationRejectRequest;
    }) => rejectMigration(storeId, migrationId, data),
    onSuccess: (_, { storeId, migrationId }) => {
      // Invalidate migration lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storeMigrations(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.storeMigration(storeId, migrationId),
      });
    },
  });
}
