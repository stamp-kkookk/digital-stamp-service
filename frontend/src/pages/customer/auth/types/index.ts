/**
 * TypeScript types for customer auth flow
 */

export type AuthStep = 'phone' | 'otp' | 'register' | 'login';
export type FlowType = 'register' | 'login';

export interface AuthFlowState {
  currentStep: AuthStep;
  phoneNumber: string;
  otpCode: string;
  name: string;
  nickname: string;
  flowType: FlowType;
  storeId: string;
  isLoading: boolean;
  error: string | null;
  otpSentAt: Date | null;
  otpSessionId: string | null;
  canResendOtp: boolean;
}

export interface AuthFlowActions {
  submitPhone: () => Promise<void>;
  submitOtp: () => Promise<void>;
  submitRegistration: () => Promise<void>;
  submitLogin: () => Promise<void>;
  goBack: () => void;
  clearError: () => void;
  resendOtp: () => Promise<void>;
  setPhoneNumber: (phone: string) => void;
  setOtpCode: (otp: string) => void;
  setName: (name: string) => void;
  setNickname: (nickname: string) => void;
}

export interface PhoneInputStepProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface OtpVerificationStepProps {
  otpCode: string;
  setOtpCode: (otp: string) => void;
  onSubmit: () => Promise<void>;
  onResend: () => Promise<void>;
  canResend: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface RegistrationStepProps {
  name: string;
  nickname: string;
  setName: (name: string) => void;
  setNickname: (nickname: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface LoginStepProps {
  phoneNumber: string;
  name: string;
  setPhoneNumber: (phone: string) => void;
  setName: (name: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  storeId: string;
}
