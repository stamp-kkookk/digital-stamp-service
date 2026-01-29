/**
 * LoginStep - Alternative flow for returning customers
 * Login with phone + name
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/shared/form/PhoneInput';
import { Input } from '@/components/ui/input';
import { loginSchema } from '@/lib/utils/validation/customer';
import type { LoginFormData } from '@/lib/utils/validation/customer';
import type { LoginStepProps } from '../types';

const LoginStep = ({
  phoneNumber,
  name,
  setPhoneNumber,
  setName,
  onSubmit,
  isLoading,
  error,
  clearError,
}: LoginStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      phone: phoneNumber,
      name,
    },
  });

  const phoneValue = watch('phone');

  const handlePhoneChange = (value: string) => {
    setValue('phone', value, { shouldValidate: true });
    setPhoneNumber(value);
    clearError();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    clearError();
  };

  const onSubmitForm = async (data: LoginFormData) => {
    setPhoneNumber(data.phone);
    setName(data.name);
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-kkookk-navy">로그인</h1>
        <p className="text-sm text-kkookk-steel">전화번호와 이름을 입력해주세요.</p>
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

      {/* Name input */}
      <Input
        label="성함"
        placeholder="홍길동"
        error={errors.name?.message}
        disabled={isLoading}
        {...register('name', { onChange: handleNameChange })}
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
        로그인
      </Button>
    </form>
  );
};

export default LoginStep;
