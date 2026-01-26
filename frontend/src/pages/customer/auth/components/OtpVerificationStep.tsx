/**
 * OtpVerificationStep - Step 2 for registration flow
 * 4-digit OTP verification with auto-focus and resend
 */

import { useState, useRef, useEffect } from 'react';
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
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Sync digits with otpCode prop
  useEffect(() => {
    if (otpCode === '') {
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  }, [otpCode]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Update otpCode
    const newOtp = newDigits.join('');
    setOtpCode(newOtp);
    clearError();

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 4) {
      const newDigits = pastedData.split('').slice(0, 4);
      setDigits(newDigits);
      setOtpCode(pastedData);
      clearError();
      inputRefs[3].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 4) {
      onSubmit();
    }
  };

  const isComplete = otpCode.length === 4;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">인증번호 입력</h1>
        <p className="text-sm text-gray-600">전송된 4자리 번호를 입력해주세요.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* OTP inputs */}
      <div className="flex justify-center gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Resend link */}
      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend || isLoading}
          className="text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          문자가 오지 않나요?{' '}
          <span className="font-medium underline">{canResend ? '다시 보내기' : '30초 후 재전송'}</span>
        </button>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isComplete || isLoading}
        className="w-full h-14 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '인증 중...' : '인증 완료'}
      </button>
    </form>
  );
};

export default OtpVerificationStep;
