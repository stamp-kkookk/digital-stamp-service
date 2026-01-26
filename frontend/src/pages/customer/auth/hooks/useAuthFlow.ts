/**
 * useAuthFlow - State management hook for customer auth flow
 * Handles multi-step registration and login flows
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockSendOtp, mockVerifyOtp, mockRegister, mockLogin } from '../../../../../mock/auth';
import { validatePhone, validateOtp, validateName, validateNickname } from '../../../../lib/utils/validation';
import type { AuthFlowState, AuthFlowActions, FlowType, AuthStep } from '../types';

const OTP_RESEND_COOLDOWN = 30000; // 30 seconds

export const useAuthFlow = (storeId: string, flowType: FlowType) => {
  const navigate = useNavigate();

  const [state, setState] = useState<AuthFlowState>({
    currentStep: flowType === 'register' ? 'phone' : 'login',
    phoneNumber: '',
    otpCode: '',
    name: '',
    nickname: '',
    flowType,
    storeId,
    isLoading: false,
    error: null,
    otpSentAt: null,
    otpSessionId: null,
    canResendOtp: false,
  });

  // OTP resend cooldown timer
  useEffect(() => {
    if (!state.otpSentAt) {
      return;
    }

    const checkCooldown = () => {
      const elapsed = Date.now() - state.otpSentAt!.getTime();
      if (elapsed >= OTP_RESEND_COOLDOWN) {
        setState((prev) => ({ ...prev, canResendOtp: true }));
      }
    };

    // Check immediately
    checkCooldown();

    // Then check every second
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [state.otpSentAt]);

  // Field setters
  const setPhoneNumber = useCallback((phoneNumber: string) => {
    setState((prev) => ({ ...prev, phoneNumber, error: null }));
  }, []);

  const setOtpCode = useCallback((otpCode: string) => {
    setState((prev) => ({ ...prev, otpCode, error: null }));
  }, []);

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name, error: null }));
  }, []);

  const setNickname = useCallback((nickname: string) => {
    setState((prev) => ({ ...prev, nickname, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Submit phone number (Step 1 for register flow)
  const submitPhone = useCallback(async () => {
    // Validate
    const error = validatePhone(state.phoneNumber);
    if (error) {
      setState((prev) => ({ ...prev, error }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mockSendOtp(state.phoneNumber);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        currentStep: 'otp',
        otpSessionId: result.sessionId,
        otpSentAt: new Date(),
        canResendOtp: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '오류가 발생했습니다',
      }));
    }
  }, [state.phoneNumber]);

  // Resend OTP
  const resendOtp = useCallback(async () => {
    if (!state.canResendOtp) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mockSendOtp(state.phoneNumber);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        otpSessionId: result.sessionId,
        otpSentAt: new Date(),
        canResendOtp: false,
        otpCode: '', // Clear previous OTP input
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '오류가 발생했습니다',
      }));
    }
  }, [state.canResendOtp, state.phoneNumber]);

  // Submit OTP (Step 2 for register flow)
  const submitOtp = useCallback(async () => {
    // Validate
    const error = validateOtp(state.otpCode);
    if (error) {
      setState((prev) => ({ ...prev, error }));
      return;
    }

    if (!state.otpSessionId) {
      setState((prev) => ({ ...prev, error: '세션이 만료되었습니다. 다시 시도해주세요.' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await mockVerifyOtp(state.otpSessionId, state.otpCode);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        currentStep: 'register',
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '오류가 발생했습니다',
      }));
    }
  }, [state.otpCode, state.otpSessionId]);

  // Submit registration (Step 3 for register flow)
  const submitRegistration = useCallback(async () => {
    // Validate
    const nameError = validateName(state.name);
    if (nameError) {
      setState((prev) => ({ ...prev, error: nameError }));
      return;
    }

    const nicknameError = validateNickname(state.nickname);
    if (nicknameError) {
      setState((prev) => ({ ...prev, error: nicknameError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mockRegister({
        phoneNumber: state.phoneNumber,
        name: state.name,
        nickname: state.nickname,
        storeId: state.storeId,
      });

      // Update localStorage
      localStorage.setItem('authToken', result.authToken);
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('hasWallet', 'true');
      localStorage.setItem('userName', state.name);

      // Navigate back to card summary
      navigate(`/c/store/${state.storeId}`);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '오류가 발생했습니다',
      }));
    }
  }, [state.phoneNumber, state.name, state.nickname, state.storeId, navigate]);

  // Submit login (for returning customers)
  const submitLogin = useCallback(async () => {
    // Validate
    const phoneError = validatePhone(state.phoneNumber);
    if (phoneError) {
      setState((prev) => ({ ...prev, error: phoneError }));
      return;
    }

    const nameError = validateName(state.name);
    if (nameError) {
      setState((prev) => ({ ...prev, error: nameError }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mockLogin(state.phoneNumber, state.name);

      // Update localStorage
      localStorage.setItem('authToken', result.authToken);
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('hasWallet', result.hasWallet ? 'true' : 'false');
      localStorage.setItem('userName', state.name);

      // Navigate to wallet page (for MVP: card summary)
      navigate(`/c/store/${state.storeId}`);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '오류가 발생했습니다',
      }));
    }
  }, [state.phoneNumber, state.name, state.storeId, navigate]);

  // Go back to previous step
  const goBack = useCallback(() => {
    setState((prev) => {
      let newStep: AuthStep = prev.currentStep;

      if (prev.currentStep === 'otp') {
        newStep = 'phone';
      } else if (prev.currentStep === 'register') {
        newStep = 'otp';
      } else if (prev.currentStep === 'phone') {
        // Go back to card summary
        navigate(`/c/store/${state.storeId}`);
        return prev;
      } else if (prev.currentStep === 'login') {
        // Go back to card summary
        navigate(`/c/store/${state.storeId}`);
        return prev;
      }

      return {
        ...prev,
        currentStep: newStep,
        error: null,
      };
    });
  }, [state.storeId, navigate]);

  const actions: AuthFlowActions = {
    submitPhone,
    submitOtp,
    submitRegistration,
    submitLogin,
    goBack,
    clearError,
    resendOtp,
    setPhoneNumber,
    setOtpCode,
    setName,
    setNickname,
  };

  return {
    state,
    actions,
  };
};
