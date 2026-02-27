/**
 * Migration API Service for KKOOKK
 * Handles both Customer and Owner migration operations
 */

import { apiClient, postRaw, getRaw } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  CreateMigrationRequest,
  MigrationRequestResponse,
  MigrationListItemResponse,
  MigrationSummary,
  MigrationDetailResponse,
  MigrationApproveRequest,
  MigrationApproveResponse,
  MigrationRejectRequest,
  MigrationRejectResponse,
} from '@/types/api';

// =============================================================================
// Multipart Helper
// =============================================================================

function buildMigrationFormData(data: CreateMigrationRequest, imageFile: File): FormData {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  formData.append('image', imageFile);
  return formData;
}

// =============================================================================
// Customer Migration API
// =============================================================================

export async function createMigration(
  data: CreateMigrationRequest,
  imageFile: File
): Promise<MigrationRequestResponse> {
  const formData = buildMigrationFormData(data, imageFile);
  const response = await apiClient.post<MigrationRequestResponse>(
    API_ENDPOINTS.CUSTOMER.MIGRATIONS,
    formData
  );
  return response.data;
}

export async function getMigration(
  migrationId: number
): Promise<MigrationRequestResponse> {
  return getRaw<MigrationRequestResponse>(
    API_ENDPOINTS.CUSTOMER.MIGRATION(migrationId)
  );
}

export async function getMigrationList(): Promise<MigrationListItemResponse[]> {
  return getRaw<MigrationListItemResponse[]>(API_ENDPOINTS.CUSTOMER.MIGRATIONS);
}

// =============================================================================
// Owner Migration API
// =============================================================================

export async function getStoreMigrations(
  storeId: number
): Promise<MigrationSummary[]> {
  const response = await getRaw<{ migrations: MigrationSummary[] }>(
    API_ENDPOINTS.OWNER.STORE_MIGRATIONS(storeId)
  );
  return response.migrations;
}

export async function getStoreMigrationDetail(
  storeId: number,
  migrationId: number
): Promise<MigrationDetailResponse> {
  return getRaw<MigrationDetailResponse>(
    API_ENDPOINTS.OWNER.STORE_MIGRATION(storeId, migrationId)
  );
}

export async function approveMigration(
  storeId: number,
  migrationId: number,
  data: MigrationApproveRequest
): Promise<MigrationApproveResponse> {
  return postRaw<MigrationApproveResponse, MigrationApproveRequest>(
    API_ENDPOINTS.OWNER.STORE_MIGRATION_APPROVE(storeId, migrationId),
    data
  );
}

export async function rejectMigration(
  storeId: number,
  migrationId: number,
  data: MigrationRejectRequest
): Promise<MigrationRejectResponse> {
  return postRaw<MigrationRejectResponse, MigrationRejectRequest>(
    API_ENDPOINTS.OWNER.STORE_MIGRATION_REJECT(storeId, migrationId),
    data
  );
}
