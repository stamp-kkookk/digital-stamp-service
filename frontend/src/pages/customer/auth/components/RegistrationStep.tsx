/**
 * RegistrationStep - Step 3 for registration flow
 * Collect name and nickname to create wallet
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerRegistrationSchema } from '@/lib/utils/validation/customer';
import type { CustomerRegistrationFormData } from '@/lib/utils/validation/customer';
import type { RegistrationStepProps } from '../types';

const RegistrationStep = ({
  name,
  nickname,
  setName,
  setNickname,
  onSubmit,
  isLoading,
  error,
  clearError,
}: RegistrationStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomerRegistrationFormData>({
    resolver: zodResolver(customerRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      name,
      nickname,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    clearError();
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    clearError();
  };

  const onSubmitForm = async (data: CustomerRegistrationFormData) => {
    setName(data.name);
    setNickname(data.nickname);
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-kkookk-navy">반가워요! 👋</h1>
        <p className="text-sm text-kkookk-steel">사용하실 이름을 알려주세요.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-kkookk-red-50 border border-kkookk-red/20">
          <span className="text-sm text-kkookk-red">{error}</span>
        </div>
      )}

      {/* Name input */}
      <Input
        label="성함"
        placeholder="홍길동"
        error={errors.name?.message}
        disabled={isLoading}
        {...register('name', { onChange: handleNameChange })}
      />

      {/* Nickname input */}
      <Input
        label="닉네임"
        placeholder="커피왕"
        maxLength={10}
        showCharCount
        error={errors.nickname?.message}
        disabled={isLoading}
        {...register('nickname', { onChange: handleNicknameChange })}
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
        지갑 만들고 시작하기
      </Button>
    </form>
  );
};

export default RegistrationStep;
