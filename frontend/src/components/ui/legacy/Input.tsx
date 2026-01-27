import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full px-4 transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-white border-black/5 focus:border-kkookk-orange-500 focus:ring-kkookk-orange-500/30',
        filled:
          'bg-kkookk-navy-50 border-transparent focus:bg-white focus:border-kkookk-orange-500 focus:ring-kkookk-orange-500/30',
      },
      inputSize: {
        sm: 'h-10 text-sm rounded-xl',
        md: 'h-14 text-base rounded-2xl',
      },
      hasError: {
        true: 'border-kkookk-red focus:border-kkookk-red focus:ring-kkookk-red/30',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      hasError: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
  showCharCount?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      maxLength,
      showCharCount = false,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;
    const characterCount =
      showCharCount && maxLength ? String(value || '').length : null;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-kkookk-navy mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-kkookk-steel pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputVariants({
              variant,
              inputSize,
              hasError,
              className: [
                leftIcon && 'pl-12',
                rightIcon && 'pr-12',
                className,
              ].filter(Boolean).join(' '),
            })}
            maxLength={maxLength}
            value={value}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-kkookk-steel pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {showCharCount && maxLength && (
          <div className="mt-1 text-right">
            <span className="text-xs text-kkookk-steel">
              {characterCount}/{maxLength}
            </span>
          </div>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-kkookk-red"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-kkookk-steel">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
