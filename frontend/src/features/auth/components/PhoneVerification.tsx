/**
 * PhoneVerification 컴포넌트
 * 휴대폰 번호 확인을 위한 OTP 인증 폼
 */

import { useState } from 'react';
import { Smartphone, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PhoneVerificationProps {
  phone: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function PhoneVerification({
  phone,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
}: PhoneVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }
    onVerify(verificationCode);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-right-4"
    >
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Smartphone size={24} />
        </div>
        <p className="text-sm text-kkookk-navy font-bold">{phone}</p>
        <p className="text-xs text-kkookk-steel">
          위 번호로 인증번호를 보냈습니다.
        </p>
      </div>

      <Input
        type="text"
        label="인증번호"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="123456"
        icon={<KeyRound size={18} />}
        className="tracking-widest font-mono focus:border-indigo-600!"
        maxLength={6}
        inputMode="numeric"
        autoComplete="one-time-code"
      />

      <Button
        type="submit"
        variant="navy"
        size="full"
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            확인 중...
          </>
        ) : (
          '인증 완료'
        )}
      </Button>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-kkookk-steel hover:text-kkookk-navy"
        >
          전화번호 다시 입력하기
        </button>
        <button
          type="button"
          onClick={onResend}
          className="text-sm text-kkookk-indigo hover:text-blue-700"
        >
          인증번호 재전송
        </button>
      </div>
    </form>
  );
}

export default PhoneVerification;
