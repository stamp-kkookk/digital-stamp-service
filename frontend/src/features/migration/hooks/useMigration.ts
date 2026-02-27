/**
 * Migration Hooks for KKOOKK Customer
 * TanStack Query hooks for stamp migration operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMigration,
  getMigration,
  getMigrationList,
} from '../api/migrationApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import type { CreateMigrationRequest } from '@/types/api';

// =============================================================================
// Create Migration Hook
// =============================================================================

export function useCreateMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, imageFile }: { data: CreateMigrationRequest; imageFile: File }) =>
      createMigration(data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.migrations() });
    },
  });
}

// =============================================================================
// Migration Status Hook
// =============================================================================

export function useMigrationStatus(migrationId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.migration(migrationId ?? 0),
    queryFn: () => getMigration(migrationId!),
    enabled: !!migrationId,
  });
}

// =============================================================================
// Migration List Hook
// =============================================================================

export function useMigrationList() {
  return useQuery({
    queryKey: QUERY_KEYS.migrations(),
    queryFn: () => getMigrationList(),
  });
}
