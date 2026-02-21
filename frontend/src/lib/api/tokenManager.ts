/**
 * Token Manager for KKOOKK Authentication
 * Manages multiple token types: customer, owner
 */

// =============================================================================
// Constants
// =============================================================================

const TOKEN_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_TYPE: 'token_type',
  USER_INFO: 'user_info',
} as const;

export type TokenType = 'customer' | 'owner';

// =============================================================================
// Safe Storage Access (handles cases where localStorage is unavailable)
// =============================================================================

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage not available (private browsing, iframe restrictions, etc.)
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage not available
  }
}

// =============================================================================
// Token Type Info
// =============================================================================

export interface UserInfo {
  id: number;
  name?: string | null;
  phone?: string;
  email?: string;
  nickname?: string;
}

// =============================================================================
// Auth Token Management (Customer / Owner)
// =============================================================================

export function setAuthToken(token: string, refreshToken: string, type: TokenType): void {
  safeSetItem(TOKEN_KEYS.AUTH_TOKEN, token);
  safeSetItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  safeSetItem(TOKEN_KEYS.TOKEN_TYPE, type);
}

export function getAuthToken(): string | null {
  return safeGetItem(TOKEN_KEYS.AUTH_TOKEN);
}

export function getRefreshToken(): string | null {
  return safeGetItem(TOKEN_KEYS.REFRESH_TOKEN);
}

export function getTokenType(): TokenType | null {
  return safeGetItem(TOKEN_KEYS.TOKEN_TYPE) as TokenType | null;
}

export function clearAuthToken(): void {
  safeRemoveItem(TOKEN_KEYS.AUTH_TOKEN);
  safeRemoveItem(TOKEN_KEYS.REFRESH_TOKEN);
  safeRemoveItem(TOKEN_KEYS.TOKEN_TYPE);
  safeRemoveItem(TOKEN_KEYS.USER_INFO);
}

// =============================================================================
// User Info Management
// =============================================================================

export function setUserInfo(info: UserInfo): void {
  safeSetItem(TOKEN_KEYS.USER_INFO, JSON.stringify(info));
}

export function getUserInfo(): UserInfo | null {
  const info = safeGetItem(TOKEN_KEYS.USER_INFO);
  if (!info) return null;
  try {
    return JSON.parse(info) as UserInfo;
  } catch {
    return null;
  }
}

// =============================================================================
// Auth State Helpers
// =============================================================================

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function isCustomer(): boolean {
  return getTokenType() === 'customer';
}

export function isOwner(): boolean {
  return getTokenType() === 'owner';
}

// =============================================================================
// Full Logout
// =============================================================================

export function logout(): void {
  clearAuthToken();
}
