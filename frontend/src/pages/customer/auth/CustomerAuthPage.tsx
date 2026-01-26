/**
 * CustomerAuthPage - Route wrapper and flow orchestrator
 * Handles both registration and login flows
 */

import { useParams, useSearchParams } from 'react-router-dom';
import { useAuthFlow } from './hooks/useAuthFlow';
import AuthLayout from './components/AuthLayout';
import PhoneInputStep from './components/PhoneInputStep';
import OtpVerificationStep from './components/OtpVerificationStep';
import RegistrationStep from './components/RegistrationStep';
import LoginStep from './components/LoginStep';
import type { FlowType } from './types';

const CustomerAuthPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();

  // Get flow type from query params (default: register)
  const flowType = (searchParams.get('type') as FlowType) || 'register';

  // Initialize auth flow
  if (!storeId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <p className="text-red-600">잘못된 접근입니다.</p>
      </div>
    );
  }

  const { state, actions } = useAuthFlow(storeId, flowType);

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 'phone':
        return (
          <PhoneInputStep
            phoneNumber={state.phoneNumber}
            setPhoneNumber={actions.setPhoneNumber}
            onSubmit={actions.submitPhone}
            isLoading={state.isLoading}
            error={state.error}
            clearError={actions.clearError}
          />
        );

      case 'otp':
        return (
          <OtpVerificationStep
            otpCode={state.otpCode}
            setOtpCode={actions.setOtpCode}
            onSubmit={actions.submitOtp}
            onResend={actions.resendOtp}
            canResend={state.canResendOtp}
            isLoading={state.isLoading}
            error={state.error}
            clearError={actions.clearError}
          />
        );

      case 'register':
        return (
          <RegistrationStep
            name={state.name}
            nickname={state.nickname}
            setName={actions.setName}
            setNickname={actions.setNickname}
            onSubmit={actions.submitRegistration}
            isLoading={state.isLoading}
            error={state.error}
            clearError={actions.clearError}
          />
        );

      case 'login':
        return (
          <LoginStep
            phoneNumber={state.phoneNumber}
            name={state.name}
            setPhoneNumber={actions.setPhoneNumber}
            setName={actions.setName}
            onSubmit={actions.submitLogin}
            isLoading={state.isLoading}
            error={state.error}
            clearError={actions.clearError}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout onBack={actions.goBack} storeId={storeId}>
      {renderStep()}
    </AuthLayout>
  );
};

export default CustomerAuthPage;
