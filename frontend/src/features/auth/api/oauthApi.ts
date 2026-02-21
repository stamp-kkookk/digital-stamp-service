/**
 * OAuth API Service
 * Handles OAuth token exchange and signup completion
 */

import { postRaw } from '@/lib/api/client';

// =============================================================================
// Types
// =============================================================================

export interface OAuthExchangeRequest {
  code: string;
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
  nickname?: string;
  phone: string;
}

// =============================================================================
// API Functions
// =============================================================================

const OAUTH_BASE = '/api/public/oauth';

export async function exchangeOAuthCode(code: string): Promise<OAuthLoginResponse> {
  return postRaw<OAuthLoginResponse, OAuthExchangeRequest>(`${OAUTH_BASE}/token`, { code });
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
