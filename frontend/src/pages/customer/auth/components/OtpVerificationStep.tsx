/**
 * OtpVerificationStep - Step 2 for registration flow
 * 4-digit OTP verification with auto-focus and resend
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/shared/form/OtpInput';
import { otpVerificationSchema } from '@/lib/utils/validation/customer';
import type { OtpVerificationFormData } from '@/lib/utils/validation/customer';
import type { OtpVerificationStepProps } from '../types';

const OtpVerificationStep = ({
  otpCode,
  setOtpCode,
  onSubmit,
  onResend,
  canResend,
  isLoading,
  error,
  clearError,
}: OtpVerificationStepProps) => {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OtpVerificationFormData>({
    resolver: zodResolver(otpVerificationSchema),
    mode: 'onChange',
    defaultValues: {
      otp: otpCode,
    },
  });

  const otpValue = watch('otp');

  // Sync with parent state
  const handleOtpChange = (value: string) => {
    setValue('otp', value, { shouldValidate: true });
    setOtpCode(value);
    clearError();
  };

  const onSubmitForm = async (data: OtpVerificationFormData) => {
    setOtpCode(data.otp);
    await onSubmit();
  };

  const isComplete = otpValue.length === 4;

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-kkookk-navy">인증번호 입력</h1>
        <p className="text-sm text-kkookk-steel">전송된 4자리 번호를 입력해주세요.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-kkookk-red-50 border border-kkookk-red/20">
          <span className="text-sm text-kkookk-red">{error}</span>
        </div>
      )}

      {/* OTP input */}
      <OtpInput
        length={4}
        value={otpValue}
        onChange={handleOtpChange}
        error={errors.otp?.message}
        disabled={isLoading}
      />

      {/* Resend link */}
      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend || isLoading}
          className="text-sm text-kkookk-steel hover:text-kkookk-navy disabled:text-kkookk-steel/40 disabled:cursor-not-allowed transition-colors"
        >
          문자가 오지 않나요?{' '}
          <span className="font-medium underline">{canResend ? '다시 보내기' : '30초 후 재전송'}</span>
        </button>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={!isComplete || isLoading}
        isLoading={isLoading}
      >
        인증 완료
      </Button>
    </form>
  );
};

export default OtpVerificationStep;
