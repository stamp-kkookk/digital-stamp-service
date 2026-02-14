/**
 * Auth Feature Types
 */

export type AuthMode = 'login' | 'signup' | 'verify';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface CustomerLoginData {
  name: string;
  phone: string;
}

export interface CustomerSignupData {
  name: string;
  nickname: string;
  phone: string;
}

export interface VerificationData {
  phone: string;
  code: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  type: 'customer' | 'owner';
}
