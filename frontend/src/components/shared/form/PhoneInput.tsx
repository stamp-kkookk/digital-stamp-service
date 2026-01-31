import React, { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { InputProps } from '@/components/ui/input';

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    // Format phone number as 010-0000-0000
    const formatPhoneNumber = (input: string): string => {
      const digits = input.replace(/\D/g, '');

      if (digits.length <= 3) {
        return digits;
      } else if (digits.length <= 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
    };

    // Update display value when value prop changes
    useEffect(() => {
      setDisplayValue(formatPhoneNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digits = input.replace(/\D/g, '');

      // Limit to 11 digits (010 + 8 digits)
      const truncatedDigits = digits.slice(0, 11);

      // Update display with formatting
      setDisplayValue(formatPhoneNumber(truncatedDigits));

      // Pass raw digits to parent
      onChange(truncatedDigits);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder="010-0000-0000"
        value={displayValue}
        onChange={handleChange}
        error={error}
        maxLength={13} // 010-0000-0000 (11 digits + 2 hyphens)
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
