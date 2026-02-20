/**
 * OAuthCallbackPage
 * Handles OAuth redirect callback after provider authorization
 * URL: /oauth/callback?code=...&state=...
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useOAuthLogin } from '../hooks/useOAuth';
import {
  getOAuthState,
  clearOAuthState,
  getOAuthRedirectUri,
  type OAuthProviderType,
} from '../utils/oauthUrl';
import { useAuth } from '@/app/providers/AuthProvider';
import { kkookkToast } from '@/components/ui/Toast';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const oauthLogin = useOAuthLogin();
  const calledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setError('인가 코드가 없습니다.');
      return;
    }

    // Restore session state
    const oauthState = getOAuthState();
    if (!oauthState) {
      setError('세션이 만료되었습니다. 다시 시도해주세요.');
      return;
    }

    const provider = (state as OAuthProviderType) || oauthState.provider;
    const { role, storeId } = oauthState;

    oauthLogin.mutate(
      {
        provider,
        code,
        redirectUri: getOAuthRedirectUri(),
        role,
        storeId: storeId ? Number(storeId) : undefined,
      },
      {
        onSuccess: (response) => {
          clearOAuthState();

          if (response.isNewUser) {
            if (role === 'TERMINAL') {
              kkookkToast.error('사장님 계정을 먼저 등록해주세요.');
              navigate('/terminal/login');
              return;
            }

            // New user → signup form with tempToken
            const signupState = {
              tempToken: response.tempToken,
              oauthName: response.oauthName,
              oauthEmail: response.oauthEmail,
              provider,
            };

            if (role === 'CUSTOMER') {
              navigate(
                storeId ? `/stores/${storeId}/customer/signup` : '/customer/login',
                { state: signupState },
              );
            } else if (role === 'OWNER') {
              navigate('/owner/login', { state: { ...signupState, showSignup: true } });
            }
            return;
          }

          // Terminal: store selection needed
          if (role === 'TERMINAL' && response.stores && response.tempToken) {
            navigate('/terminal/stores', {
              state: {
                tempToken: response.tempToken,
                ownerId: response.ownerId,
                stores: response.stores,
              },
            });
            return;
          }

          // Existing user → logged in
          refreshAuthState();

          if (role === 'CUSTOMER') {
            if (storeId) {
              sessionStorage.setItem('origin_store_id', storeId);
            }
            navigate('/customer/wallet');
          } else if (role === 'OWNER') {
            navigate('/owner/stores');
          }

          kkookkToast.success('로그인 성공');
        },
        onError: () => {
          clearOAuthState();
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
  }, [searchParams, navigate, oauthLogin, refreshAuthState]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-kkookk-steel hover:text-kkookk-indigo underline"
        >
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Loader2 className="w-10 h-10 animate-spin text-kkookk-orange-500" />
      <p className="mt-4 text-sm text-kkookk-steel">로그인 처리 중...</p>
    </div>
  );
}
