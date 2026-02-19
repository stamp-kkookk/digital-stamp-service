/**
 * API Client Configuration for KKOOKK
 * Using Axios with interceptors for authentication and error handling
 */

import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import {
  getAuthToken,
  getStepUpToken,
  clearAuthToken,
  getRefreshToken,
  setAuthToken,
  getTokenType,
} from './tokenManager';

// =============================================================================
// API Configuration
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_TIMEOUT = 30000; // 30 seconds

// =============================================================================
// Create Axios Instance
// =============================================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// Token Refresh Management (Race Condition Prevention)
// =============================================================================

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  const tokenType = getTokenType();

  if (!refreshToken || !tokenType) {
    return null;
  }

  try {
    // Create a new axios instance without interceptors to avoid infinite loop
    const refreshClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
    });

    const response = await refreshClient.post<{
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/refresh', { refreshToken });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Update tokens in storage
    setAuthToken(accessToken, newRefreshToken, tokenType);

    return accessToken;
  } catch {
    // Refresh failed - clear all tokens and redirect to login
    clearAuthToken();
    return null;
  }
}

// =============================================================================
// Request Interceptor
// =============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Use StepUp token as Bearer when available (it supersedes the auth token)
    const stepUpToken = getStepUpToken();
    const token = stepUpToken || getAuthToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// =============================================================================
// Response Interceptor (with Auto Token Refresh)
// =============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh for /api/auth/refresh endpoint itself
      if (originalRequest.url === '/api/auth/refresh') {
        clearAuthToken();
        return Promise.reject(error);
      }

      // Skip refresh if StepUp token was used (StepUp tokens don't have refresh)
      if (getStepUpToken()) {
        return Promise.reject(error);
      }

      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAuthToken();

          if (!newAccessToken) {
            // Refresh failed - reject all pending requests
            isRefreshing = false;
            return Promise.reject(error);
          }

          // Notify all waiting requests
          isRefreshing = false;
          onTokenRefreshed(newAccessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          clearAuthToken();
          return Promise.reject(refreshError);
        }
      } else {
        // Another request is already refreshing - wait for it
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });

          // Also handle the case where refresh fails
          setTimeout(() => {
            if (isRefreshing) {
              reject(error);
            }
          }, 10000); // 10 second timeout
        });
      }
    }

    // Handle other error codes
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Permission denied');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 429:
          // Rate limited
          console.error('Too many requests. Please try again later.');
          break;
        case 500:
          // Server error
          console.error('Server error. Please try again.');
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Network error
      console.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * GET request
 */
export async function getRaw<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

/**
 * POST request
 */
export async function postRaw<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

/**
 * PUT request
 */
export async function putRaw<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

/**
 * PATCH request
 */
export async function patchRaw<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
}

/**
 * DELETE request
 */
export async function delRaw<T = void>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}

export default apiClient;
