/**
 * Auth Feature Types
 */

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
