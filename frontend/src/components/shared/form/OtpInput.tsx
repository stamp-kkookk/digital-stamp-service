import React, { useRef, useState, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize otp state from value prop
  useEffect(() => {
    const digits = Array.from({ length }, (_, i) => value[i] || '');
    setOtp(digits);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Notify parent
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current input
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length).split('');

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < length) {
        newOtp[i] = digit;
      }
    });

    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focus last filled input (or last input if all filled)
    const lastFilledIndex = Math.min(digits.length - 1, length - 1);
    inputRefs.current[lastFilledIndex >= 0 ? lastFilledIndex : 0]?.focus();
  };

  const handleFocus = (index: number) => {
    // Select the digit when focusing
    inputRefs.current[index]?.select();
  };

  return (
    <div className="w-full" data-testid="otp-input-container">
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            data-testid={`otp-input-${index}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`
              w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-kkookk-red focus:border-kkookk-red focus:ring-kkookk-red/30'
                  : 'border-black/5 focus:border-kkookk-orange-500 focus:ring-kkookk-orange-500/30'
              }
            `}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-kkookk-red text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
