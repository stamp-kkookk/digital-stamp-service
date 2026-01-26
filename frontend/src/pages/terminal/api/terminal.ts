import apiClient from '../../../lib/api/client';
import type { PendingIssuancesResponse, DashboardKpi } from '../types';

interface FetchIssuancesParams {
  storeId: string;
  page?: number;
  size?: number;
}

interface ManageIssuanceParams {
  storeId: string;
  requestId: string;
}

export const fetchPendingIssuances = async ({ storeId, page = 0, size = 10 }: FetchIssuancesParams): Promise<PendingIssuancesResponse> => {
  const response = await apiClient.get(`/v1/terminals/${storeId}/issuance-requests`, {
    params: { page, size },
  });
  return response.data;
};

export const fetchDashboardKpi = async (storeId: string): Promise<DashboardKpi> => {
  const response = await apiClient.get(`/v1/terminals/${storeId}/kpi`);
  return response.data;
};

export const approveIssuance = async ({ storeId, requestId }: ManageIssuanceParams): Promise<void> => {
  await apiClient.post(`/v1/terminals/${storeId}/issuance-requests/${requestId}/approval`);
};

export const rejectIssuance = async ({ storeId, requestId }: ManageIssuanceParams): Promise<void> => {
  await apiClient.post(`/v1/terminals/${storeId}/issuance-requests/${requestId}/rejection`);
};
