import { getRaw, patchRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  AdminStoreResponse,
  AdminStoreStatusChangeRequest,
  StoreAuditLogResponse,
  StoreStatus,
} from '@/types/api';

export async function getAdminStores(
  status?: StoreStatus
): Promise<AdminStoreResponse[]> {
  return getRaw<AdminStoreResponse[]>(API_ENDPOINTS.ADMIN.STORES, status ? { status } : undefined);
}

export async function getAdminStore(storeId: number): Promise<AdminStoreResponse> {
  return getRaw<AdminStoreResponse>(API_ENDPOINTS.ADMIN.STORE(storeId));
}

export async function changeStoreStatus(
  storeId: number,
  data: AdminStoreStatusChangeRequest
): Promise<AdminStoreResponse> {
  return patchRaw<AdminStoreResponse, AdminStoreStatusChangeRequest>(
    API_ENDPOINTS.ADMIN.STORE_STATUS(storeId),
    data
  );
}

export async function getStoreAuditLogs(
  storeId: number
): Promise<StoreAuditLogResponse[]> {
  return getRaw<StoreAuditLogResponse[]>(API_ENDPOINTS.ADMIN.STORE_AUDIT_LOGS(storeId));
}
