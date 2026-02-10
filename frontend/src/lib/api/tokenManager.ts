/**
 * Token Manager for KKOOKK Authentication
 * Manages multiple token types: customer, stepUp, owner, terminal
 */

// =============================================================================
// Constants
// =============================================================================

const TOKEN_KEYS = {
  AUTH_TOKEN: 'auth_token',
  STEPUP_TOKEN: 'stepup_token',
  STEPUP_EXPIRES_AT: 'stepup_expires_at',
  TOKEN_TYPE: 'token_type',
  USER_INFO: 'user_info',
} as const;

export type TokenType = 'customer' | 'owner' | 'terminal';

const STEPUP_TTL_MS = 10 * 60 * 1000; // 10 minutes

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
// Auth Token Management (Customer / Owner / Terminal)
// =============================================================================

export function setAuthToken(token: string, type: TokenType): void {
  safeSetItem(TOKEN_KEYS.AUTH_TOKEN, token);
  safeSetItem(TOKEN_KEYS.TOKEN_TYPE, type);
}

export function getAuthToken(): string | null {
  return safeGetItem(TOKEN_KEYS.AUTH_TOKEN);
}

export function getTokenType(): TokenType | null {
  return safeGetItem(TOKEN_KEYS.TOKEN_TYPE) as TokenType | null;
}

export function clearAuthToken(): void {
  safeRemoveItem(TOKEN_KEYS.AUTH_TOKEN);
  safeRemoveItem(TOKEN_KEYS.TOKEN_TYPE);
  safeRemoveItem(TOKEN_KEYS.USER_INFO);
  clearStepUpToken();
}

// =============================================================================
// StepUp Token Management
// =============================================================================

export function setStepUpToken(token: string): void {
  const expiresAt = Date.now() + STEPUP_TTL_MS;
  safeSetItem(TOKEN_KEYS.STEPUP_TOKEN, token);
  safeSetItem(TOKEN_KEYS.STEPUP_EXPIRES_AT, expiresAt.toString());
}

export function getStepUpToken(): string | null {
  const token = safeGetItem(TOKEN_KEYS.STEPUP_TOKEN);
  const expiresAt = safeGetItem(TOKEN_KEYS.STEPUP_EXPIRES_AT);

  if (!token || !expiresAt) {
    return null;
  }

  // Check if expired
  if (Date.now() > parseInt(expiresAt, 10)) {
    clearStepUpToken();
    return null;
  }

  return token;
}

export function getStepUpRemainingSeconds(): number {
  const expiresAt = safeGetItem(TOKEN_KEYS.STEPUP_EXPIRES_AT);
  if (!expiresAt) return 0;

  const remaining = Math.floor((parseInt(expiresAt, 10) - Date.now()) / 1000);
  return Math.max(0, remaining);
}

export function isStepUpValid(): boolean {
  return getStepUpToken() !== null;
}

export function clearStepUpToken(): void {
  safeRemoveItem(TOKEN_KEYS.STEPUP_TOKEN);
  safeRemoveItem(TOKEN_KEYS.STEPUP_EXPIRES_AT);
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

export function isTerminal(): boolean {
  return getTokenType() === 'terminal';
}

// =============================================================================
// Full Logout
// =============================================================================

export function logout(): void {
  clearAuthToken();
}
