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
  isStepUpValid,
  getStepUpRemainingSeconds,
  clearAuthToken,
  clearStepUpToken,
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
  hasStepUp: boolean;
  stepUpRemainingSeconds: number;
}

interface AuthContextValue extends AuthState {
  logout: () => void;
  refreshAuthState: () => void;
  clearStepUp: () => void;
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
    hasStepUp: false,
    stepUpRemainingSeconds: 0,
  });

  // Refresh auth state from localStorage
  const refreshAuthState = useCallback(() => {
    const token = getAuthToken();
    const tokenType = getTokenType();
    const user = getUserInfo();
    const hasStepUp = isStepUpValid();
    const stepUpRemainingSeconds = getStepUpRemainingSeconds();

    setState({
      isAuthenticated: !!token,
      isLoading: false,
      tokenType,
      user,
      hasStepUp,
      stepUpRemainingSeconds,
    });
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const token = getAuthToken();
    const tokenType = getTokenType();
    const user = getUserInfo();
    const hasStepUp = isStepUpValid();
    const stepUpRemainingSeconds = getStepUpRemainingSeconds();

    setState({
      isAuthenticated: !!token,
      isLoading: false,
      tokenType,
      user,
      hasStepUp,
      stepUpRemainingSeconds,
    });
  }, []);

  // Periodically check StepUp token expiry
  useEffect(() => {
    if (!state.hasStepUp) return;

    const interval = setInterval(() => {
      const remaining = getStepUpRemainingSeconds();
      if (remaining <= 0) {
        clearStepUpToken();
        setState((prev) => ({
          ...prev,
          hasStepUp: false,
          stepUpRemainingSeconds: 0,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          stepUpRemainingSeconds: remaining,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.hasStepUp]);

  // Logout handler
  const logout = useCallback(() => {
    clearAuthToken();
    setState({
      isAuthenticated: false,
      isLoading: false,
      tokenType: null,
      user: null,
      hasStepUp: false,
      stepUpRemainingSeconds: 0,
    });
  }, []);

  // Clear StepUp token
  const clearStepUp = useCallback(() => {
    clearStepUpToken();
    setState((prev) => ({
      ...prev,
      hasStepUp: false,
      stepUpRemainingSeconds: 0,
    }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    logout,
    refreshAuthState,
    clearStepUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

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
