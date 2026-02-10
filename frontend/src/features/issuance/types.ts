/**
 * Issuance Feature Types
 */

import type { IssuanceRequest, RequestStatus } from '@/types/domain';

export interface IssuanceState {
  currentRequest: IssuanceRequest | null;
  isPolling: boolean;
  error: string | null;
}

export interface CreateIssuanceRequestData {
  storeId: string;
  cardId: string;
  count: number;
}

export type IssuanceResult = 'success' | 'rejected' | 'timeout';

export interface PollingConfig {
  intervalMs: number;
  maxAttempts: number;
  onStatusChange: (status: RequestStatus) => void;
}
