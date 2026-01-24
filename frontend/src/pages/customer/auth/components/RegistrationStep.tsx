/**
 * RegistrationStep - Step 3 for registration flow
 * Collect name and nickname to create wallet
 */

import { useState } from 'react';
import { validateName, validateNickname } from '../../../../lib/utils/validation';
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
  const [nameError, setNameError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(null);
    clearError();
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setNicknameError(null);
    clearError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const nameValidationError = validateName(name);
    const nicknameValidationError = validateNickname(nickname);

    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    if (nicknameValidationError) {
      setNicknameError(nicknameValidationError);
      return;
    }

    onSubmit();
  };

  const isValid = name.trim().length >= 2 && nickname.trim().length >= 1 && nickname.length <= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">반가워요! 👋</h1>
        <p className="text-sm text-gray-600">사용하실 이름을 알려주세요.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

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

      {/* Nickname input */}
      <div className="space-y-2">
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="커피왕"
          maxLength={10}
          className="w-full h-14 px-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          disabled={isLoading}
        />
        {nicknameError && <p className="text-sm text-red-600">{nicknameError}</p>}
        <p className="text-xs text-gray-500">{nickname.length}/10</p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full h-14 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '지갑 만드는 중...' : '지갑 만들고 시작하기'}
      </button>
    </form>
  );
};

export default RegistrationStep;
