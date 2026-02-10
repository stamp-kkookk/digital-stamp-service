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
import { isStepUpValid } from '@/lib/api/tokenManager';
import type { CreateMigrationRequest } from '@/types/api';

// =============================================================================
// Create Migration Hook (StepUp Required)
// =============================================================================

export function useCreateMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMigrationRequest) => createMigration(data),
    onSuccess: () => {
      // Invalidate migration list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.migrations() });
    },
  });
}

// =============================================================================
// Migration Status Hook (StepUp Required)
// =============================================================================

export function useMigrationStatus(migrationId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.migration(migrationId ?? 0),
    queryFn: () => getMigration(migrationId!),
    enabled: !!migrationId && isStepUpValid(),
  });
}

// =============================================================================
// Migration List Hook (StepUp Required)
// =============================================================================

export function useMigrationList() {
  return useQuery({
    queryKey: QUERY_KEYS.migrations(),
    queryFn: () => getMigrationList(),
    enabled: isStepUpValid(),
  });
}
