/**
 * Auth Hooks for KKOOKK
 * TanStack Query hooks for authentication operations
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { getStorePublicInfo } from '../api/authApi';
import { clearAuthToken } from '@/lib/api/tokenManager';
import { QUERY_KEYS } from '@/lib/api/endpoints';

// =============================================================================
// Store Public Info Hook
// =============================================================================

export function useStorePublicInfo(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.storePublicInfo(storeId ?? 0),
    queryFn: () => getStorePublicInfo(storeId!),
    enabled: !!storeId,
  });
}

// =============================================================================
// Logout Hook
// =============================================================================

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      clearAuthToken();
      return Promise.resolve();
    },
  });
}
