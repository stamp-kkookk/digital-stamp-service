import { useMutation } from '@tanstack/react-query';
import { terminalLogin } from '../api/auth';
import type { TerminalLoginRequest, TerminalLoginResponse } from '../types';

export const useOwnerLoginMutation = () => {
  return useMutation<TerminalLoginResponse, Error, TerminalLoginRequest>({
    mutationFn: terminalLogin,
    onSuccess: (data) => {
      // 로그인 성공 시 토큰 저장 (예시)
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      // 추가적인 로직 (예: 매장 선택 페이지로 리다이렉트)은 컴포넌트에서 처리
    },
    onError: (error) => {
      // 에러 처리 (예: 토스트 메시지 표시)
      console.error('Login failed:', error);
    },
  });
};
