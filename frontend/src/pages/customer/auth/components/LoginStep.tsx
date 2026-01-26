/**
 * LoginStep - Alternative flow for returning customers
 * Login with phone + name
 */

import { useState, useEffect } from 'react';
import { formatPhoneNumber, validatePhone, validateName } from '../../../../lib/utils/validation';
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
  const [displayPhone, setDisplayPhone] = useState(formatPhoneNumber(phoneNumber));
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Sync formatted display with actual value
  useEffect(() => {
    setDisplayPhone(formatPhoneNumber(phoneNumber));
  }, [phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    const cleaned = formatted.replace(/\D/g, '');

    setDisplayPhone(formatted);
    setPhoneNumber(cleaned);
    setPhoneError(null);
    clearError();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(null);
    clearError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const phoneValidationError = validatePhone(phoneNumber);
    const nameValidationError = validateName(name);

    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    onSubmit();
  };

  const isValid = phoneNumber.length === 11 && phoneNumber.startsWith('010') && name.trim().length >= 2;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
        <p className="text-sm text-gray-600">전화번호와 이름을 입력해주세요.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Phone input */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          휴대폰 번호
        </label>
        <input
          id="phone"
          type="tel"
          value={displayPhone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          className="w-full h-14 px-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          disabled={isLoading}
          maxLength={13}
        />
        {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
      </div>

      {/* Name input */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          성함
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="홍길동"
          className="w-full h-14 px-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          disabled={isLoading}
        />
        {nameError && <p className="text-sm text-red-600">{nameError}</p>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full h-14 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};

export default LoginStep;
