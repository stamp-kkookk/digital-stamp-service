/**
 * AuthProvider - Authentication Context for KKOOKK
 * Manages authentication state across the app
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getAuthToken,
  getTokenType,
  getUserInfo,
  clearAuthToken,
  type TokenType,
  type UserInfo,
} from '@/lib/api/tokenManager';

// =============================================================================
// Types
// =============================================================================

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenType: TokenType | null;
  user: UserInfo | null;
}

interface AuthContextValue extends AuthState {
  logout: () => void;
  refreshAuthState: () => void;
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    tokenType: null,
    user: null,
  });

  // Refresh auth state from localStorage
  const refreshAuthState = useCallback(() => {
    const token = getAuthToken();
    const tokenType = getTokenType();
    const user = getUserInfo();

    setState({
      isAuthenticated: !!token,
      isLoading: false,
      tokenType,
      user,
    });
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const token = getAuthToken();
    const tokenType = getTokenType();
    const user = getUserInfo();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      isAuthenticated: !!token,
      isLoading: false,
      tokenType,
      user,
    });
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    clearAuthToken();
    setState({
      isAuthenticated: false,
      isLoading: false,
      tokenType: null,
      user: null,
    });
  }, []);

  const value: AuthContextValue = {
    ...state,
    logout,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// Exports
// =============================================================================

export default AuthProvider;
