/**
 * API DTOs for KKOOKK Backend Integration
 * Based on api-docs.md
 */

// =============================================================================
// Common Types
// =============================================================================

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

// =============================================================================
// OTP Types
// =============================================================================

export interface OtpRequestDto {
  phone: string;
}

export interface OtpRequestResponse {
  success: boolean;
  devOtpCode: string | null;
}

export interface OtpVerifyDto {
  phone: string;
  code: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  stepUpToken: string | null;
}

// =============================================================================
// Wallet Types
// =============================================================================

export interface WalletRegisterRequest {
  phone: string;
  name: string;
  nickname: string;
  storeId?: number;
}

export interface RegisteredStampCardInfo {
  walletStampCardId: number;
  stampCardId: number;
  title: string;
  goalStampCount: number;
  designType: string;
  designJson: string;
  storeName: string;
}

export interface WalletRegisterResponse {
  accessToken: string;
  walletId: number;
  phone: string;
  name: string;
  nickname: string;
  stampCard: RegisteredStampCardInfo | null;
}

export interface WalletLoginRequest {
  phone: string;
  name: string;
  storeId: number;
}

export interface WalletLoginStampCard {
  walletStampCardId: number;
  stampCardId: number;
  title: string;
  goalStampCount: number;
  designType: StampCardDesignType;
  designJson: string | null;
  storeName: string;
}

export interface WalletLoginResponse {
  accessToken: string;
  walletId: number;
  phone: string;
  name: string;
  nickname: string;
  stampCard: WalletLoginStampCard | null;
}

export interface WalletStampCardListResponse {
  customerWalletId: number;
  customerName: string;
  stampCards: WalletStampCardSummary[];
}

export interface WalletStampCardStore {
  storeId: number;
  storeName: string;
}

export interface WalletStampCardSummary {
  walletStampCardId: number;
  stampCardId: number;
  title: string;
  currentStampCount: number;
  goalStampCount: number;
  progressPercentage: number;
  nextRewardName: string | null;
  nextRewardQuantity: number | null;
  stampsToNextReward: number;
  expiresAt: string;
  status: string;
  designJson: string | null;
  store: WalletStampCardStore;
  lastStampedAt: string | null;
}

export type StampCardSortType = 'LAST_STAMPED' | 'CREATED' | 'PROGRESS';

export type StampHistoryEventType = 'ISSUED' | 'REVOKED' | 'EXPIRED' | 'MIGRATED';

export interface StampHistoryItem {
  id: number;
  type: StampHistoryEventType;
  delta: number;
  reason: string;
  occurredAt: string;
}

export interface EventPageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface StampHistoryResponse {
  events: StampHistoryItem[];
  pageInfo: EventPageInfo;
}

export interface WalletRewardItem {
  id: number;
  store: WalletStampCardStore;
  rewardName: string;
  stampCardTitle: string;
  status: WalletRewardStatus;
  issuedAt: string;
  expiresAt: string;
  redeemedAt: string | null;
  designType: string | null;
  designJson: string | null;
}

export interface WalletRewardListResponse {
  rewards: WalletRewardItem[];
  pageInfo: PageInfo;
}

export type CustomerRedeemEventType = 'REQUESTED' | 'COMPLETED';
export type CustomerRedeemEventResult = 'SUCCESS' | 'FAILED';

export interface RedeemHistoryItem {
  id: number;
  redeemSessionId: number;
  store: WalletStampCardStore;
  type: CustomerRedeemEventType;
  result: CustomerRedeemEventResult;
  occurredAt: string;
}

export interface RedeemHistoryResponse {
  events: RedeemHistoryItem[];
  pageInfo: PageInfo;
}

// =============================================================================
// Issuance Types
// =============================================================================

export interface CreateIssuanceRequest {
  storeId: number;
  walletStampCardId: number;
  idempotencyKey: string;
}

export type IssuanceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface IssuanceRequestResponse {
  id: number;
  status: IssuanceRequestStatus;
  expiresAt: string;
  remainingSeconds: number;
  currentStampCount: number;
  rewardsIssued: number | null;
  createdAt: string;
}

// =============================================================================
// Redeem Types
// =============================================================================

export interface CreateRedeemSessionRequest {
  walletRewardId: number;
}

export type RedeemSessionStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED';

export interface RedeemSessionResponse {
  sessionId: number;
  walletRewardId: number;
  status: RedeemSessionStatus;
  expiresAt: string;
  remainingSeconds: number;
  createdAt: string;
}

// =============================================================================
// Migration Types
// =============================================================================

export interface CreateMigrationRequest {
  storeId: number;
  imageData: string;
  claimedStampCount: number;
}

export type StampMigrationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELED';

// Customer: full migration detail (with base64 imageData)
export interface MigrationRequestResponse {
  id: number;
  customerWalletId: number;
  storeId: number;
  status: StampMigrationStatus;
  imageData: string;
  claimedStampCount: number;
  approvedStampCount: number | null;
  rejectReason: string | null;
  requestedAt: string;
  processedAt: string | null;
  slaMessage: string;
}

// Customer: list item (no imageData)
export interface MigrationListItemResponse {
  id: number;
  storeId: number;
  storeName?: string;
  status: StampMigrationStatus;
  claimedStampCount: number;
  approvedStampCount: number | null;
  rejectReason: string | null;
  requestedAt: string;
  processedAt: string | null;
}

// Owner: migration list item (returned in { migrations: [...] } wrapper)
export interface MigrationSummary {
  id: number;
  customerPhone: string;
  customerName: string;
  claimedStampCount: number;
  status: StampMigrationStatus;
  requestedAt: string;
}

// Owner: migration detail (with hosted imageUrl)
export interface MigrationDetailResponse {
  id: number;
  customerWalletId: number;
  customerPhone: string;
  customerName: string;
  imageUrl: string;
  claimedStampCount: number;
  status: StampMigrationStatus;
  approvedStampCount: number | null;
  rejectReason: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export interface MigrationApproveRequest {
  approvedStampCount: number;
}

export interface MigrationApproveResponse {
  id: number;
  status: string;
  approvedStampCount: number;
  processedAt: string;
}

export interface MigrationRejectRequest {
  rejectReason: string;
}

export interface MigrationRejectResponse {
  id: number;
  status: string;
  rejectReason: string;
  processedAt: string;
}

// =============================================================================
// Owner Auth Types
// =============================================================================

export interface OwnerSignupRequest {
  email: string;
  password: string;
  name?: string;
  phoneNumber: string;
}

export interface OwnerSignupResponse {
  id: number;
  email: string;
  name: string | null;
  phoneNumber: string;
  createdAt: string;
}

export interface OwnerLoginRequest {
  email: string;
  password: string;
}

export interface OwnerLoginResponse {
  accessToken: string;
  id: number;
  email: string;
  name: string | null;
  phoneNumber: string;
}

// =============================================================================
// Store Types
// =============================================================================

export type StoreStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface StoreCreateRequest {
  name: string;
  address?: string;
  phone?: string;
  status: StoreStatus;
}

export interface StoreUpdateRequest {
  name: string;
  address?: string;
  phone?: string;
  status: StoreStatus;
}

export interface StoreResponse {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
  ownerAccountId: number;
}

export interface StorePublicInfoResponse {
  storeId: number;
  storeName: string;
  activeStampCardCount: number;
}

export interface QrCodeResponse {
  qrCodeBase64: string;
}

// =============================================================================
// StampCard Types
// =============================================================================

export type StampCardStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type StampCardDesignType = 'COLOR' | 'IMAGE' | 'PUZZLE';

export interface CreateStampCardRequest {
  title: string;
  goalStampCount: number;
  requiredStamps?: number;
  rewardName?: string;
  rewardQuantity?: number;
  expireDays?: number;
  designType?: StampCardDesignType;
  designJson?: string;
}

export interface UpdateStampCardRequest {
  title?: string;
  goalStampCount?: number;
  requiredStamps?: number;
  rewardName?: string;
  rewardQuantity?: number;
  expireDays?: number;
  designType?: StampCardDesignType;
  designJson?: string;
}

export interface StampCardResponse {
  id: number;
  title: string;
  status: StampCardStatus;
  goalStampCount: number;
  requiredStamps: number;
  rewardName: string | null;
  rewardQuantity: number | null;
  expireDays: number | null;
  designType: StampCardDesignType;
  designJson: string | null;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface StampCardSummary {
  id: number;
  title: string;
  status: StampCardStatus;
  goalStampCount: number;
  rewardName: string | null;
  rewardQuantity: number | null;
  expireDays: number | null;
  designType: StampCardDesignType;
  createdAt: string;
}

export interface StampCardListResponse {
  content: StampCardSummary[];
  page: PageInfo;
}

export interface StampCardStatusUpdateRequest {
  status: StampCardStatus;
}

// =============================================================================
// Statistics Types
// =============================================================================

export interface DailyStampCount {
  date: string;
  count: number;
}

export interface StoreStatisticsResponse {
  startDate: string;
  endDate: string;
  totalStamps: number;
  totalRewardsIssued: number;
  totalRewardsRedeemed: number;
  activeUsers: number;
  dailyTrend: DailyStampCount[];
}

// =============================================================================
// Stamp Events Types (Owner)
// =============================================================================

export type StampEventType = 'ISSUED' | 'MIGRATED' | 'MANUAL_ADJUST';

export interface StampEventResponse {
  id: number;
  walletStampCardId: number;
  customerName: string;
  customerPhone: string;
  type: StampEventType;
  delta: number;
  reason: string;
  occurredAt: string;
}

// =============================================================================
// Redeem Events Types (Owner)
// =============================================================================

export type OwnerRedeemEventType = 'REQUESTED' | 'COMPLETED';
export type OwnerRedeemEventResult = 'SUCCESS' | 'FAILED';

export interface RedeemEventResponse {
  id: number;
  redeemSessionId: number;
  customerNickname: string;
  rewardName: string;
  stampCardTitle: string;
  type: OwnerRedeemEventType;
  result: OwnerRedeemEventResult;
  occurredAt: string;
}

// =============================================================================
// Terminal Auth Types
// =============================================================================

export interface TerminalLoginRequest {
  email: string;
  password: string;
  storeId: number;
}

export interface TerminalLoginResponse {
  accessToken: string;
  ownerId: number;
  storeId: number;
  storeName: string;
}

// =============================================================================
// Terminal Types
// =============================================================================

export interface PendingIssuanceRequestItem {
  id: number;
  customerName: string;
  requestedAt: string;
  elapsedSeconds: number;
  remainingSeconds: number;
}

export interface PendingIssuanceRequestListResponse {
  items: PendingIssuanceRequestItem[];
  count: number;
}

export interface IssuanceApprovalResponse {
  id: number;
  status: 'APPROVED';
  processedAt: string;
  stampDelta: number;
  currentStampCount: number;
}

export interface IssuanceRejectionResponse {
  id: number;
  status: 'REJECTED';
  processedAt: string;
}

export interface PendingRedeemSessionItem {
  sessionId: number;
  customerNickname: string;
  rewardName: string;
  remainingSeconds: number;
  createdAt: string;
}

export interface PendingRedeemSessionListResponse {
  sessions: PendingRedeemSessionItem[];
  totalCount: number;
}

// =============================================================================
// Enums (Wallet Reward)
// =============================================================================

export type WalletRewardStatus = 'AVAILABLE' | 'REDEEMING' | 'REDEEMED' | 'EXPIRED';

// =============================================================================
// Store Summary Types (Customer)
// =============================================================================

export interface StoreSummaryStampCard {
  stampCardId: number;
  title: string;
  rewardName: string | null;
  goalStampCount: number;
  designJson: string | null;
}

export interface StoreSummaryResponse {
  storeName: string;
  stampCard: StoreSummaryStampCard | null;
}
