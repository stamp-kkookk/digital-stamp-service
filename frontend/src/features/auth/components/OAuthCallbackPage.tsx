/**
 * OAuthCallbackPage
 * Handles OAuth completion after backend-handled OAuth flow
 * URL: /oauth/complete?code=...&role=...&storeId=...
 *   or /oauth/complete?error=...
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useExchangeOAuthCode } from '../hooks/useOAuth';
import { getOAuthState, clearOAuthState } from '../utils/oauthUrl';
import { useAuth } from '@/app/providers/AuthProvider';
import { setAuthToken, setUserInfo } from '@/lib/api/tokenManager';
import { saveOriginStoreId } from '@/hooks/useCustomerNavigate';
import { kkookkToast } from '@/components/ui/Toast';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const exchangeCode = useExchangeOAuthCode();
  const calledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    // Check for error from backend
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      clearOAuthState();
      return;
    }

    // Exchange code for tokens
    const code = searchParams.get('code');
    if (!code) {
      setError('교환 코드가 없습니다.');
      return;
    }

    // Get role/storeId from URL params (set by backend redirect) or session storage fallback
    const oauthState = getOAuthState();
    const role = searchParams.get('role') || oauthState?.role || 'CUSTOMER';
    const storeId = searchParams.get('storeId') || oauthState?.storeId;

    const performExchange = async () => {
      try {
        const response = await exchangeCode.mutateAsync(code);

        clearOAuthState();

        if (response.isNewUser) {
          // New user → signup form with tempToken
          const signupState = {
            tempToken: response.tempToken,
            oauthName: response.oauthName,
            oauthEmail: response.oauthEmail,
          };

          if (role === 'CUSTOMER') {
            navigate(
              storeId ? `/stores/${storeId}/customer` : '/customer/login',
              { state: signupState, replace: true },
            );
          } else if (role === 'OWNER') {
            navigate('/owner/login', { state: { ...signupState, showSignup: true }, replace: true });
          }
          return;
        }

        // Existing user → save tokens and log in
        const tokenType = role === 'OWNER' ? 'owner' : 'customer';
        if (response.accessToken && response.refreshToken) {
          setAuthToken(response.accessToken, response.refreshToken, tokenType);
          setUserInfo({
            id: response.id!,
            name: response.name,
            nickname: response.nickname,
            email: response.email,
            phone: response.phone,
          });
        }
        refreshAuthState();

        if (role === 'CUSTOMER') {
          if (storeId) {
            saveOriginStoreId(storeId);
          }
          navigate('/customer/wallet', { replace: true });
        } else if (role === 'OWNER') {
          navigate('/owner/stores', { replace: true });
        }

        kkookkToast.success('로그인 성공');
      } catch {
        clearOAuthState();
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    };

    performExchange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
