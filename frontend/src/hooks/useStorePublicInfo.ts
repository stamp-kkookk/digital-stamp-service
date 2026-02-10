/**
 * useStorePublicInfo / usePublicStores
 * 공개 매장 정보 TanStack Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { getStorePublicInfo, getPublicStores } from '@/features/auth/api/authApi';
import { QUERY_KEYS } from '@/lib/api/endpoints';

export function useStorePublicInfo(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.storePublicInfo(storeId!),
    queryFn: () => getStorePublicInfo(storeId!),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicStores() {
  return useQuery({
    queryKey: QUERY_KEYS.publicStores(),
    queryFn: getPublicStores,
    staleTime: 5 * 60 * 1000,
  });
}
