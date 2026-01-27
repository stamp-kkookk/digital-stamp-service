import { z } from 'zod';

/**
 * Phone number validation schema
 * Format: 010XXXXXXXX (11 digits, starting with 010)
 */
export const phoneSchema = z
  .string()
  .length(11, '전화번호는 11자리여야 합니다')
  .regex(/^010\d{8}$/, '올바른 휴대폰 번호를 입력해주세요');

/**
 * OTP code validation schema
 * Format: 4 or 6 digits (flexible for different implementations)
 */
export const otpSchema = z
  .string()
  .min(4, 'OTP 코드는 최소 4자리입니다')
  .max(6, 'OTP 코드는 최대 6자리입니다')
  .regex(/^\d{4,6}$/, '숫자만 입력 가능합니다');

/**
 * OTP code validation schema - 4 digits (current implementation)
 */
export const otp4DigitSchema = z
  .string()
  .length(4, 'OTP 코드는 4자리입니다')
  .regex(/^\d{4}$/, '숫자만 입력 가능합니다');

/**
 * OTP code validation schema - 6 digits (for future use)
 */
export const otp6DigitSchema = z
  .string()
  .length(6, 'OTP 코드는 6자리입니다')
  .regex(/^\d{6}$/, '숫자만 입력 가능합니다');

/**
 * Name validation schema
 * Length: 2-50 characters
 */
export const nameSchema = z
  .string()
  .min(2, '이름은 2자 이상이어야 합니다')
  .max(50, '이름은 50자 이하여야 합니다')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글 또는 영문만 입력 가능합니다');

/**
 * Nickname validation schema
 * Length: 1-10 characters
 */
export const nicknameSchema = z
  .string()
  .min(1, '닉네임을 입력해주세요')
  .max(10, '닉네임은 10자 이하여야 합니다');

/**
 * Birth date validation schema
 * Format: YYYYMMDD (8 digits)
 */
export const birthDateSchema = z
  .string()
  .length(8, '생년월일은 8자리여야 합니다 (YYYYMMDD)')
  .regex(/^\d{8}$/, '숫자만 입력 가능합니다')
  .refine(
    (val) => {
      const year = parseInt(val.substring(0, 4));
      const month = parseInt(val.substring(4, 6));
      const day = parseInt(val.substring(6, 8));

      // Basic validation
      if (year < 1900 || year > new Date().getFullYear()) return false;
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;

      return true;
    },
    { message: '올바른 생년월일을 입력해주세요' }
  );

/**
 * Customer registration form schema (simplified - name + nickname only)
 */
export const customerRegistrationSchema = z.object({
  name: nameSchema,
  nickname: nicknameSchema,
});

export type CustomerRegistrationFormData = z.infer<typeof customerRegistrationSchema>;

/**
 * Customer registration form schema (full - with phone and birthDate)
 */
export const customerRegistrationFullSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  nickname: nicknameSchema,
  birthDate: birthDateSchema,
});

export type CustomerRegistrationFullFormData = z.infer<typeof customerRegistrationFullSchema>;

/**
 * Phone input form schema
 */
export const phoneInputSchema = z.object({
  phone: phoneSchema,
});

export type PhoneInputFormData = z.infer<typeof phoneInputSchema>;

/**
 * Login form schema (phone + name)
 */
export const loginSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * OTP verification form schema (4 digits)
 */
export const otpVerificationSchema = z.object({
  otp: otp4DigitSchema,
});

export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;
