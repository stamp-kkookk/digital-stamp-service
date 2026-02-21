/**
 * OAuth URL Builder
 * Generates provider-specific OAuth authorization URLs
 */

export type OAuthProviderType = 'GOOGLE' | 'KAKAO' | 'NAVER';

const OAUTH_CONFIG = {
  GOOGLE: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid profile email',
  },
  KAKAO: {
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    scope: 'profile_nickname',
  },
  NAVER: {
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    scope: '',
  },
} as const;

const OAUTH_CLIENT_IDS: Record<OAuthProviderType, string> = {
  GOOGLE: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  KAKAO: import.meta.env.VITE_KAKAO_CLIENT_ID ?? '',
  NAVER: import.meta.env.VITE_NAVER_CLIENT_ID ?? '',
};

export function getOAuthRedirectUri(): string {
  return `${window.location.origin}/oauth/callback`;
}

export function buildOAuthUrl(provider: OAuthProviderType): string {
  const config = OAUTH_CONFIG[provider];
  const clientId = OAUTH_CLIENT_IDS[provider];
  const redirectUri = getOAuthRedirectUri();
  const state = provider;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  if (config.scope) {
    params.set('scope', config.scope);
  }

  return `${config.authUrl}?${params.toString()}`;
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
