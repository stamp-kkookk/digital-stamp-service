/**
 * CustomerLoginForm 컴포넌트
 * 기존 고객을 위한 이름 + 휴대폰 번호 간편 로그인 폼
 */

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useCustomerNavigate, saveOriginStoreId } from '@/hooks/useCustomerNavigate';
import { useAuth } from '@/app/providers/AuthProvider';
import { kkookkToast } from '@/components/ui/Toast';
import { useWalletLogin } from '@/features/auth/hooks/useAuth';
import { formatPhoneNumber, hasInvalidPhoneChars, stripPhoneToDigits } from '@/lib/utils/format';

export function CustomerLoginForm() {
  const navigate = useNavigate();
  const { storeId } = useCustomerNavigate();
  const { refreshAuthState } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const loginMutation = useWalletLogin();

  const phoneDigitCount = stripPhoneToDigits(phone).length;
  const isPhoneComplete = phoneDigitCount >= 10 && phoneDigitCount <= 11;
  const isFormValid = name.trim() !== '' && isPhoneComplete && !phoneError;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (hasInvalidPhoneChars(rawValue)) {
      setPhoneError("숫자만 입력해주세요");
    } else {
      setPhoneError(null);
    }
    setPhone(formatPhoneNumber(rawValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid) return;

    loginMutation.mutate(
      {
        phone: stripPhoneToDigits(phone),
        name,
        ...(storeId && { storeId: Number(storeId) }),
      },
      {
        onSuccess: () => {
          if (storeId) saveOriginStoreId(storeId);
          refreshAuthState();
          kkookkToast.success('로그인 성공');
          navigate('/customer/wallet');
        },
        onError: () => {
          setError('존재하지 않는 지갑입니다. 회원가입을 먼저 해주세요.');
        },
      }
    );
  };

  return (
    <div className="h-full p-6 pt-12 flex flex-col bg-white">
      <div className="flex items-center mb-6 -ml-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-kkookk-steel"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-kkookk-navy">
        반가워요!
        <br />
        지갑을 찾아드릴게요.
      </h2>
      <p className="text-kkookk-steel text-sm mb-10">
        가입하신 정보를 입력해주세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          autoComplete="name"
        />

        <Input
          type="tel"
          label="휴대폰 번호"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          autoComplete="tel"
          maxLength={13}
          error={phoneError ?? undefined}
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="full"
          isLoading={loginMutation.isPending}
          disabled={!isFormValid || loginMutation.isPending}
          className="mt-4"
        >
          지갑 열기
        </Button>

        {/* 직접 로그인 시에만 표시되는 안내 문구 */}
        {!storeId && (
          <p className="mt-4 text-xs text-center text-gray-500">
            처음 방문하시나요? 가게에서 QR 코드를 스캔하여 시작하세요
          </p>
        )}
      </form>
    </div>
  );
}

export default CustomerLoginForm;
