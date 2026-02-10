/**
 * API Endpoints Constants for KKOOKK
 */

export const API_ENDPOINTS = {
  // ==========================================================================
  // Public API (인증 불필요)
  // ==========================================================================
  PUBLIC: {
    OTP_REQUEST: '/api/public/otp/request',
    OTP_VERIFY: '/api/public/otp/verify',
    WALLET_REGISTER: '/api/public/wallet/register',
    WALLET_LOGIN: '/api/public/wallet/login',
    STORE_INFO: (storeId: number) => `/api/public/stores/${storeId}`,
    STORES: '/api/public/stores',
  },

  // ==========================================================================
  // Customer API (Customer Token 필요)
  // ==========================================================================
  CUSTOMER: {
    // Wallet
    WALLET_STAMP_CARDS: '/api/customer/wallet/my-stamp-cards',
    STAMP_HISTORY: (storeId: number) =>
      `/api/customer/wallet/stores/${storeId}/stamp-history`,
    REDEEM_HISTORY: (storeId: number) =>
      `/api/customer/wallet/stores/${storeId}/redeem-history`,
    WALLET_REWARDS: '/api/customer/wallet/rewards',

    // Issuance
    ISSUANCE_REQUESTS: '/api/customer/issuance-requests',
    ISSUANCE_REQUEST: (id: number) => `/api/customer/issuance-requests/${id}`,

    // Redeem
    REDEEM_SESSIONS: '/api/customer/redeem-sessions',
    REDEEM_SESSION_COMPLETE: (sessionId: number) =>
      `/api/customer/redeem-sessions/${sessionId}/complete`,

    // Migration
    MIGRATIONS: '/api/customer/migrations',
    MIGRATION: (id: number) => `/api/customer/migrations/${id}`,

    // Store Summary
    STORE_SUMMARY: (storeId: number) => `/api/customer/stores/${storeId}/summary`,
  },

  // ==========================================================================
  // Owner API (Owner Token 필요)
  // ==========================================================================
  OWNER: {
    // Auth
    SIGNUP: '/api/owner/auth/signup',
    LOGIN: '/api/owner/auth/login',

    // Stores
    STORES: '/api/owner/stores',
    STORE: (storeId: number) => `/api/owner/stores/${storeId}`,
    STORE_QR: (storeId: number) => `/api/owner/stores/${storeId}/qr`,
    STORE_STATISTICS: (storeId: number) => `/api/owner/stores/${storeId}/statistics`,
    STORE_STAMP_EVENTS: (storeId: number) => `/api/owner/stores/${storeId}/stamp-events`,
    STORE_REDEEM_EVENTS: (storeId: number) => `/api/owner/stores/${storeId}/redeem-events`,

    // Stamp Cards
    STAMP_CARDS: (storeId: number) => `/api/owner/stores/${storeId}/stamp-cards`,
    STAMP_CARD: (storeId: number, stampCardId: number) =>
      `/api/owner/stores/${storeId}/stamp-cards/${stampCardId}`,
    STAMP_CARD_STATUS: (storeId: number, stampCardId: number) =>
      `/api/owner/stores/${storeId}/stamp-cards/${stampCardId}/status`,

    // Migrations
    STORE_MIGRATIONS: (storeId: number) => `/api/owner/stores/${storeId}/migrations`,
    STORE_MIGRATION: (storeId: number, migrationId: number) =>
      `/api/owner/stores/${storeId}/migrations/${migrationId}`,
    STORE_MIGRATION_APPROVE: (storeId: number, migrationId: number) =>
      `/api/owner/stores/${storeId}/migrations/${migrationId}/approve`,
    STORE_MIGRATION_REJECT: (storeId: number, migrationId: number) =>
      `/api/owner/stores/${storeId}/migrations/${migrationId}/reject`,
  },

  // ==========================================================================
  // Terminal API (Terminal Token 필요)
  // ==========================================================================
  TERMINAL: {
    LOGIN: '/api/public/terminal/login',
    ISSUANCE_REQUESTS: (storeId: number) => `/api/terminal/${storeId}/issuance-requests`,
    APPROVE_ISSUANCE: (storeId: number, requestId: number) =>
      `/api/terminal/${storeId}/issuance-requests/${requestId}/approve`,
    REJECT_ISSUANCE: (storeId: number, requestId: number) =>
      `/api/terminal/${storeId}/issuance-requests/${requestId}/reject`,
    REDEEM_SESSIONS: (storeId: number) => `/api/terminal/${storeId}/redeem-sessions`,
    STAMP_EVENTS: (storeId: number) => `/api/terminal/stores/${storeId}/stamp-events`,
  },
} as const;

// Query Key Factory for TanStack Query
export const QUERY_KEYS = {
  // Customer
  walletStampCards: (storeId: number) => ['wallet', 'stampCards', storeId] as const,
  stampHistory: (storeId: number) =>
    ['wallet', 'stampHistory', storeId] as const,
  redeemHistory: (storeId: number) => ['wallet', 'redeemHistory', storeId] as const,
  walletRewards: (status?: string) => ['wallet', 'rewards', { status }] as const,
  issuanceRequest: (id: number) => ['issuance', 'request', id] as const,
  storeSummary: (storeId: number) => ['customer', 'store', storeId, 'summary'] as const,
  migrations: () => ['customer', 'migrations'] as const,
  migration: (id: number) => ['customer', 'migration', id] as const,

  // Owner
  stores: () => ['owner', 'stores'] as const,
  store: (storeId: number) => ['owner', 'store', storeId] as const,
  storeQr: (storeId: number) => ['owner', 'store', storeId, 'qr'] as const,
  storeStatistics: (storeId: number, startDate?: string, endDate?: string) =>
    ['owner', 'store', storeId, 'statistics', { startDate, endDate }] as const,
  storeStampEvents: (storeId: number) =>
    ['owner', 'store', storeId, 'stampEvents'] as const,
  storeRedeemEvents: (storeId: number) =>
    ['owner', 'store', storeId, 'redeemEvents'] as const,
  stampCards: (storeId: number, status?: string) =>
    ['owner', 'store', storeId, 'stampCards', { status }] as const,
  stampCard: (storeId: number, stampCardId: number) =>
    ['owner', 'store', storeId, 'stampCard', stampCardId] as const,
  storeMigrations: (storeId: number) =>
    ['owner', 'store', storeId, 'migrations'] as const,
  storeMigration: (storeId: number, migrationId: number) =>
    ['owner', 'store', storeId, 'migration', migrationId] as const,

  // Terminal
  pendingIssuanceRequests: (storeId: number) =>
    ['terminal', storeId, 'pendingIssuances'] as const,
  pendingRedeemSessions: (storeId: number) =>
    ['terminal', storeId, 'pendingRedeems'] as const,

  // Public
  storePublicInfo: (storeId: number) => ['public', 'store', storeId] as const,
  publicStores: () => ['public', 'stores'] as const,
} as const;
