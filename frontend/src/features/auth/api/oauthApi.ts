/**
 * OAuth API Service
 * Handles OAuth login, signup completion, and terminal selection
 */

import { postRaw } from '@/lib/api/client';
import type { OAuthProviderType } from '../utils/oauthUrl';

// =============================================================================
// Types
// =============================================================================

export interface OAuthLoginRequest {
  provider: OAuthProviderType;
  code: string;
  redirectUri: string;
  role: string;
  storeId?: number;
}

export interface OAuthStoreItem {
  id: number;
  name: string;
}

export interface OAuthLoginResponse {
  isNewUser: boolean;
  tempToken?: string;
  oauthName?: string;
  oauthEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  id?: number;
  name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  ownerId?: number;
  stores?: OAuthStoreItem[];
}

export interface CompleteCustomerSignupRequest {
  tempToken: string;
  name: string;
  nickname: string;
  phone: string;
  storeId?: number;
}

export interface CompleteOwnerSignupRequest {
  tempToken: string;
  name: string;
  nickname: string;
  phone: string;
}

export interface TerminalSelectRequest {
  tempToken: string;
  storeId: number;
}

// =============================================================================
// API Functions
// =============================================================================

const OAUTH_BASE = '/api/public/oauth';

export async function oauthLogin(data: OAuthLoginRequest): Promise<OAuthLoginResponse> {
  return postRaw<OAuthLoginResponse, OAuthLoginRequest>(`${OAUTH_BASE}/login`, data);
}

export async function completeCustomerSignup(
  data: CompleteCustomerSignupRequest,
): Promise<OAuthLoginResponse> {
  return postRaw<OAuthLoginResponse, CompleteCustomerSignupRequest>(
    `${OAUTH_BASE}/complete-customer-signup`,
    data,
  );
}

export async function completeOwnerSignup(
  data: CompleteOwnerSignupRequest,
): Promise<OAuthLoginResponse> {
  return postRaw<OAuthLoginResponse, CompleteOwnerSignupRequest>(
    `${OAUTH_BASE}/complete-owner-signup`,
    data,
  );
}

export async function terminalSelect(data: TerminalSelectRequest): Promise<OAuthLoginResponse> {
  return postRaw<OAuthLoginResponse, TerminalSelectRequest>(
    `${OAUTH_BASE}/terminal-select`,
    data,
  );
}
