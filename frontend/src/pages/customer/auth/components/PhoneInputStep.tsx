/**
 * PhoneInputStep - Step 1 for registration flow
 * Collect and validate phone number, send OTP
 */

import { useState, useEffect } from 'react';
import { formatPhoneNumber, validatePhone } from '../../../../lib/utils/validation';
import type { PhoneInputStepProps } from '../types';

const PhoneInputStep = ({
  phoneNumber,
  setPhoneNumber,
  onSubmit,
  isLoading,
  error,
  clearError,
}: PhoneInputStepProps) => {
  const [displayPhone, setDisplayPhone] = useState(formatPhoneNumber(phoneNumber));
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync formatted display with actual value
  useEffect(() => {
    setDisplayPhone(formatPhoneNumber(phoneNumber));
  }, [phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    const cleaned = formatted.replace(/\D/g, '');

    setDisplayPhone(formatted);
    setPhoneNumber(cleaned);
    setValidationError(null);
    clearError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submit
    const error = validatePhone(phoneNumber);
    if (error) {
      setValidationError(error);
      return;
    }

    onSubmit();
  };

  const isValid = phoneNumber.length === 11 && phoneNumber.startsWith('010');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">전화번호를 입력해주세요</h1>
        <p className="text-sm text-gray-600">본인 확인 및 적립을 위해 필요합니다.</p>
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
          maxLength={13} // 010-0000-0000
        />
        {validationError && <p className="text-sm text-red-600">{validationError}</p>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full h-14 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '전송 중...' : '다음'}
      </button>
    </form>
  );
};

export default PhoneInputStep;
