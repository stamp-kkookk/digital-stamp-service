/**
 * PhoneInputStep - Step 1 for registration flow
 * Collect and validate phone number, send OTP
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/shared/form/PhoneInput';
import { phoneInputSchema } from '@/lib/utils/validation/customer';
import type { PhoneInputFormData } from '@/lib/utils/validation/customer';
import type { PhoneInputStepProps } from '../types';

const PhoneInputStep = ({
  phoneNumber,
  setPhoneNumber,
  onSubmit,
  isLoading,
  error,
  clearError,
}: PhoneInputStepProps) => {
  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<PhoneInputFormData>({
    resolver: zodResolver(phoneInputSchema),
    mode: 'onChange',
    defaultValues: {
      phone: phoneNumber,
    },
  });

  const phoneValue = watch('phone');

  // Sync with parent state
  const handlePhoneChange = (value: string) => {
    setValue('phone', value, { shouldValidate: true });
    setPhoneNumber(value);
    clearError();
  };

  const onSubmitForm = async (data: PhoneInputFormData) => {
    setPhoneNumber(data.phone);
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-kkookk-navy">전화번호를 입력해주세요</h1>
        <p className="text-sm text-kkookk-steel">본인 확인 및 적립을 위해 필요합니다.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-kkookk-red-50 border border-kkookk-red/20">
          <span className="text-sm text-kkookk-red">{error}</span>
        </div>
      )}

      {/* Phone input */}
      <PhoneInput
        label="휴대폰 번호"
        value={phoneValue}
        onChange={handlePhoneChange}
        error={errors.phone?.message}
        disabled={isLoading}
      />

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={!isValid || isLoading}
        isLoading={isLoading}
      >
        다음
      </Button>
    </form>
  );
};

export default PhoneInputStep;
