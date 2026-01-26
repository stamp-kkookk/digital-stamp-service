import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TerminalLoginRequest } from '../../types';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다.'),
  password_hash: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

interface TerminalLoginFormProps {
  onSubmit: (data: TerminalLoginRequest) => void;
  isPending: boolean;
  error?: string;
}

const TerminalLoginForm = ({ onSubmit, isPending, error }: TerminalLoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TerminalLoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          아이디 (이메일)
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isPending}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password_hash" className="block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          type="password"
          id="password_hash"
          {...register('password_hash')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isPending}
        />
        {errors.password_hash && (
          <p className="mt-2 text-sm text-red-600">{errors.password_hash.message}</p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={isPending}
      >
        {isPending ? '로그인 중...' : '관리자 로그인'}
      </button>

      <div className="text-center mt-4">
        <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
          처음이신가요? 사장님 백오피스에서 매장을 등록한 후 단말기 로그인이 가능합니다.
        </a>
      </div>
    </form>
  );
};

export default TerminalLoginForm;
