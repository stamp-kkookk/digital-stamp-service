/**
 * OAuth URL Builder
 * Generates backend OAuth authorization URL (backend-handled flow)
 */

export type OAuthProviderType = 'GOOGLE' | 'KAKAO' | 'NAVER';

export function getOAuthAuthorizeUrl(
  provider: OAuthProviderType,
  role: string,
  storeId?: string,
): string {
  let url = `/api/public/oauth2/authorization/${provider.toLowerCase()}?role=${role}`;
  if (storeId) {
    url += `&storeId=${storeId}`;
  }
  return url;
}

export interface OAuthSessionState {
  provider: OAuthProviderType;
  role: string;
  storeId?: string;
}

export function saveOAuthState(state: OAuthSessionState): void {
  try {
    sessionStorage.setItem('oauth_state', JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getOAuthState(): OAuthSessionState | null {
  try {
    const raw = sessionStorage.getItem('oauth_state');
    if (!raw) return null;
    return JSON.parse(raw) as OAuthSessionState;
  } catch {
    return null;
  }
}

export function clearOAuthState(): void {
  try {
    sessionStorage.removeItem('oauth_state');
  } catch {
    // ignore
  }
}
