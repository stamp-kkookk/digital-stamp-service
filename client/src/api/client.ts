import axios from 'axios';
import type { ErrorResponse } from '../types/error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add wallet session if available
    const walletSession = localStorage.getItem('walletSession');
    if (walletSession) {
      config.headers['X-Wallet-Session'] = walletSession;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Setup response interceptor with toast handler
export function setupErrorInterceptor(showToast: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => void) {
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle errors globally
      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        const errorData = data as ErrorResponse;

        // Log error for debugging
        console.error('API Error:', { status, errorData });

        // Display error to user
        if (errorData?.message) {
          showToast(errorData.message, 'error');
        } else {
          // Fallback error messages
          switch (status) {
            case 400:
              showToast('잘못된 요청입니다.', 'error');
              break;
            case 401:
              showToast('인증이 필요합니다.', 'error');
              break;
            case 403:
              showToast('권한이 없습니다.', 'error');
              break;
            case 404:
              showToast('요청한 리소스를 찾을 수 없습니다.', 'error');
              break;
            case 409:
              showToast('요청이 충돌합니다.', 'error');
              break;
            case 410:
              showToast('요청이 만료되었습니다.', 'error');
              break;
            case 429:
              showToast('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
              break;
            case 500:
              showToast('서버 오류가 발생했습니다.', 'error');
              break;
            default:
              showToast('오류가 발생했습니다.', 'error');
          }
        }
      } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', error.message);
        showToast('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.', 'error');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        showToast('예기치 않은 오류가 발생했습니다.', 'error');
      }

      return Promise.reject(error);
    }
  );
}
