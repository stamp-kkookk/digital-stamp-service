import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import {
  getAdminStores,
  getAdminStore,
  changeStoreStatus,
  getStoreAuditLogs,
} from '../api/adminApi';
import type { AdminStoreStatusChangeRequest, StoreStatus } from '@/types/api';

export function useAdminStores(status?: StoreStatus) {
  return useQuery({
    queryKey: QUERY_KEYS.adminStores(status),
    queryFn: () => getAdminStores(status),
  });
}

export function useAdminStore(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.adminStore(storeId ?? 0),
    queryFn: () => getAdminStore(storeId!),
    enabled: !!storeId,
  });
}

export function useChangeStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: number;
      data: AdminStoreStatusChangeRequest;
    }) => changeStoreStatus(storeId, data),
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminStores() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminStore(storeId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminAuditLogs(storeId) });
    },
  });
}

export function useStoreAuditLogs(storeId: number | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAuditLogs(storeId ?? 0),
    queryFn: () => getStoreAuditLogs(storeId!),
    enabled: !!storeId,
  });
}
