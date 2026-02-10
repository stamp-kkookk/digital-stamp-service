/**
 * Migration Feature Types
 */

import type { MigrationRequest, MigrationStatus } from '@/types/domain';

export interface MigrationState {
  requests: MigrationRequest[];
  isLoading: boolean;
  error: string | null;
}

export interface MigrationFormData {
  storeName: string;
  count: number;
  imageFile: File | null;
}

export interface MigrationActionData {
  id: string;
  newStatus: MigrationStatus;
  approvedCount?: number;
  rejectReason?: string;
}
