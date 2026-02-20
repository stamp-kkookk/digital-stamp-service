/**
 * OAuth API Service
 * Handles OAuth login and signup completion
 */

import { postRaw } from '@/lib/api/client';

// =============================================================================
// Types
// =============================================================================

export interface OAuthLoginRequest {
  provider: string;
  code: string;
  redirectUri: string;
  role: string;
  storeId?: number;
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
