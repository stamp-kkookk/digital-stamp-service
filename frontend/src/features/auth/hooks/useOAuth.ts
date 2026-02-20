/**
 * OAuth Hooks
 * TanStack Query hooks for OAuth authentication
 */

import { useMutation } from '@tanstack/react-query';
import {
  oauthLogin,
  completeCustomerSignup,
  completeOwnerSignup,
  type OAuthLoginRequest,
  type CompleteCustomerSignupRequest,
  type CompleteOwnerSignupRequest,
} from '../api/oauthApi';
import { setAuthToken, setUserInfo } from '@/lib/api/tokenManager';

export function useOAuthLogin() {
  return useMutation({
    mutationFn: (data: OAuthLoginRequest) => oauthLogin(data),
    onSuccess: (response) => {
      if (!response.isNewUser && response.accessToken && response.refreshToken) {
        // Determine token type from role context
        if (response.phone) {
          // Customer login
          setAuthToken(response.accessToken, response.refreshToken, 'customer');
          setUserInfo({
            id: response.id!,
            name: response.name,
            phone: response.phone,
            nickname: response.nickname,
          });
        } else if (response.email) {
          // Owner login
          setAuthToken(response.accessToken, response.refreshToken, 'owner');
          setUserInfo({
            id: response.id!,
            name: response.name,
            email: response.email,
            phone: response.phone,
          });
        }
      }
    },
  });
}

export function useOAuthCompleteCustomerSignup() {
  return useMutation({
    mutationFn: (data: CompleteCustomerSignupRequest) => completeCustomerSignup(data),
    onSuccess: (response) => {
      if (response.accessToken && response.refreshToken) {
        setAuthToken(response.accessToken, response.refreshToken, 'customer');
        setUserInfo({
          id: response.id!,
          name: response.name,
          phone: response.phone,
          nickname: response.nickname,
        });
      }
    },
  });
}

export function useOAuthCompleteOwnerSignup() {
  return useMutation({
    mutationFn: (data: CompleteOwnerSignupRequest) => completeOwnerSignup(data),
    onSuccess: (response) => {
      if (response.accessToken && response.refreshToken) {
        setAuthToken(response.accessToken, response.refreshToken, 'owner');
        setUserInfo({
          id: response.id!,
          name: response.name,
          email: response.email,
          phone: response.phone,
        });
      }
    },
  });
}
