/**
 * Domain Types for KKOOKK Stamp/Reward System
 */

// =============================================================================
// Stamp Card Types
// =============================================================================

export type StampCardTheme = 'orange' | 'green' | 'yellow' | 'gray';
export type StampCardStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface StampCard {
  id: string;
  storeId?: number;
  storeName: string;
  current: number;
  max: number;
  reward: string;
  theme: StampCardTheme;
  status: StampCardStatus;
  bgGradient?: string;
  shadowColor?: string;
  stampColor?: string;
  backgroundImage?: string | null;
  stampImage?: string | null;
  expiryDays?: number;
}

export interface AdminStampCard {
  id: number;
  name: string;
  status: 'draft' | 'active' | 'inactive';
  benefit: string;
  created: string;
}

// =============================================================================
// Reward Types
// =============================================================================

export interface Reward {
  id: string;
  storeName: string;
  stampCardTitle: string;
  name: string;
  expiry: string;
  isUsed: boolean;
  designJson: string | null;
}

// =============================================================================
// Request Types
// =============================================================================

export type RequestType = 'stamp' | 'reward';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface IssuanceRequest {
  id: string;
  type: RequestType;
  user: string;
  phone: string;
  count: number;
  time: Date;
  status: RequestStatus;
  store: string;
}

// =============================================================================
// Migration Types
// =============================================================================

export type MigrationStatus = 'pending' | 'approved' | 'rejected';

export interface MigrationRequest {
  id: string;
  storeName: string;
  customerName?: string;
  customerPhone?: string;
  count: number;
  status: MigrationStatus;
  date: Date;
  imageUrl?: string;
  rejectReason?: string;
}

// =============================================================================
// Store Types
// =============================================================================

export type StoreStatus = 'OPEN' | 'CLOSED';

export interface Store {
  id: number;
  name: string;
  address: string;
  status: StoreStatus;
  activeCards: number;
  phone?: string;
  category?: string;
  description?: string;
}

// =============================================================================
// Statistics Types
// =============================================================================

export interface WeeklyDataPoint {
  day: string;
  value: number;
}

export interface StoreStats {
  totalStamps: number;
  totalCoupons: number;
  usedCoupons: number;
  weeklyData: WeeklyDataPoint[];
  retentionRate: number;
  newCustomers: number;
}

// =============================================================================
// User Types
// =============================================================================

export interface CustomerWallet {
  id: string;
  phone: string;
  name: string;
  nickname?: string;
  createdAt: Date;
}

export interface OwnerAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
}

// =============================================================================
// Auth Types
// =============================================================================

export type AuthMode = 'login' | 'signup' | 'verify';

export interface AuthFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  verificationCode: string;
}

// =============================================================================
// Redeem Session Types
// =============================================================================

export type RedeemSessionStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface RedeemSession {
  id: string;
  rewardId: string;
  walletId: string;
  storeId: string;
  status: RedeemSessionStatus;
  ttlSeconds: number;
  createdAt: Date;
  expiresAt: Date;
}

// =============================================================================
// Design/Template Types (for Stamp Card Creation)
// =============================================================================

export type TemplateType = 'basic' | 'premium' | 'custom';
export type ColorTheme = 'orange' | 'indigo' | 'emerald' | 'purple' | 'rose';
export type TextColorOption = 'black' | 'white';

export interface StampCardDesign {
  template: TemplateType;
  color: ColorTheme;
  cardName: string;
  maxStamps: number;
  reward: string;
  backgroundImage: string | null;
  stampImage: string | null;
  textColor: TextColorOption;
}
