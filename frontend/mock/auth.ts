/**
 * Mock API functions for customer authentication flow
 * These will be replaced with real API calls when backend is ready
 */

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validates phone number format
 */
const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('010');
};

/**
 * 1. Send OTP to phone number
 * @returns sessionId for OTP verification
 */
export const mockSendOtp = async (phoneNumber: string): Promise<{ success: boolean; sessionId: string }> => {
  await delay(800);

  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error('유효하지 않은 전화번호입니다');
  }

  return {
    success: true,
    sessionId: 'mock-session-' + Date.now(),
  };
};

/**
 * 2. Verify OTP code
 * Test OTP: "1234" always works
 */
export const mockVerifyOtp = async (_sessionId: string, otpCode: string): Promise<{ verified: boolean }> => {
  await delay(600);

  // Accept "1234" as valid OTP for testing
  if (otpCode !== '1234') {
    throw new Error('인증번호가 일치하지 않습니다');
  }

  return { verified: true };
};

/**
 * 3. Register new customer (create wallet)
 */
export const mockRegister = async (data: {
  phoneNumber: string;
  name: string;
  nickname: string;
  storeId: string;
}): Promise<{ userId: string; walletId: string; authToken: string }> => {
  await delay(1000);

  if (!data.name || !data.nickname) {
    throw new Error('모든 정보를 입력해주세요');
  }

  if (data.name.length < 2) {
    throw new Error('이름은 2글자 이상이어야 합니다');
  }

  if (data.nickname.length > 10) {
    throw new Error('닉네임은 10글자 이하여야 합니다');
  }

  return {
    userId: 'mock-user-' + Date.now(),
    walletId: 'mock-wallet-' + Date.now(),
    authToken: 'mock-token-' + Date.now(),
  };
};

/**
 * 4. Login existing customer
 * Mock: phone numbers starting with 010 are treated as existing users
 */
export const mockLogin = async (
  phoneNumber: string,
  name: string
): Promise<{ userId: string; authToken: string; hasWallet: boolean }> => {
  await delay(800);

  if (!phoneNumber.startsWith('010')) {
    throw new Error('가입되지 않은 사용자입니다');
  }

  if (!name.trim()) {
    throw new Error('이름을 입력해주세요');
  }

  return {
    userId: 'mock-existing-user-' + Date.now(),
    authToken: 'mock-token-' + Date.now(),
    hasWallet: true,
  };
};
