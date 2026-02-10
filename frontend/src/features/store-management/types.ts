/**
 * Store Management Feature Types
 */

import type { Store } from '@/types/domain';

export type StoreDetailTab = 'cards' | 'history' | 'migrations';
export type CardViewMode = 'list' | 'create';
export type HistoryFilter = 'all' | 'stamp' | 'reward';

export interface StoreManagementState {
  stores: Store[];
  selectedStore: Store | null;
  isCreatingStore: boolean;
  storeDetailTab: StoreDetailTab;
  cardViewMode: CardViewMode;
  historyFilter: HistoryFilter;
  showQRModal: boolean;
  statsCard: { name: string } | null;
}

export interface StoreFormData {
  name: string;
  address: string;
  phone?: string;
  category?: string;
  description?: string;
}
