import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { TerminalLoginRequest } from '../../types';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다.'),
  password_hash: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

interface OwnerLoginFormProps {
  onSubmit: (data: TerminalLoginRequest) => void;
  isPending: boolean;
  error?: string;
}

const OwnerLoginForm = ({ onSubmit, isPending, error }: OwnerLoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TerminalLoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="아이디 (이메일)"
        type="email"
        error={errors.email?.message}
        disabled={isPending}
        {...register('email')}
      />

      <Input
        label="비밀번호"
        type="password"
        error={errors.password_hash?.message}
        disabled={isPending}
        {...register('password_hash')}
      />

      {error && (
        <p className="mt-2 text-sm text-kkookk-red text-center">{error}</p>
      )}

      <Button
        type="submit"
        variant="secondary"
        size="md"
        className="w-full"
        disabled={isPending}
        isLoading={isPending}
      >
        관리자 로그인
      </Button>

      <div className="text-center mt-4">
        <a href="#" className="text-sm text-kkookk-indigo hover:text-kkookk-indigo-600">
          처음이신가요? 회원가입 후 매장을 등록하고 관리를 시작하세요.
        </a>
      </div>
    </form>
  );
};

export default OwnerLoginForm;
