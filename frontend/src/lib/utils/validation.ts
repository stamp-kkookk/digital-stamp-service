/**
 * Validation utility functions for auth flow
 */

/**
 * Validate phone number (11 digits, starts with 010)
 */
export const validatePhone = (phone: string): string | null => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return '전화번호는 11자리여야 합니다';
  }

  if (!cleaned.startsWith('010')) {
    return '올바른 휴대폰 번호를 입력해주세요';
  }

  return null;
};

/**
 * Validate OTP code (exactly 4 digits)
 */
export const validateOtp = (otp: string): string | null => {
  if (otp.length !== 4) {
    return '인증번호 4자리를 입력해주세요';
  }

  if (!/^\d{4}$/.test(otp)) {
    return '숫자만 입력 가능합니다';
  }

  return null;
};

/**
 * Validate name (2+ characters)
 */
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return '이름을 입력해주세요';
  }

  if (name.length < 2) {
    return '이름은 2글자 이상이어야 합니다';
  }

  return null;
};

/**
 * Validate nickname (1-10 characters)
 */
export const validateNickname = (nickname: string): string | null => {
  if (!nickname.trim()) {
    return '닉네임을 입력해주세요';
  }

  if (nickname.length > 10) {
    return '닉네임은 10글자 이하여야 합니다';
  }

  return null;
};

/**
 * Format phone number with dashes (010-0000-0000)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length <= 3) {
    return cleaned;
  }

  if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
};
