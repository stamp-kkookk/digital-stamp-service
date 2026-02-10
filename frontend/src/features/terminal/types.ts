/**
 * Terminal Feature Types
 */

import type { StoreStatus } from '@/types/domain';

export interface TerminalState {
  isLoggedIn: boolean;
  storeStatus: StoreStatus;
  isPolling: boolean;
}

export interface TerminalConfig {
  storeName: string;
  pollingIntervalMs: number;
}
