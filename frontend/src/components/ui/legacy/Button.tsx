import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-kkookk-orange-500 text-white hover:bg-kkookk-orange-600 active:bg-kkookk-orange-700 focus:ring-kkookk-orange-500/30',
        secondary:
          'bg-kkookk-indigo text-white hover:bg-kkookk-indigo-600 active:bg-kkookk-indigo-700 focus:ring-kkookk-indigo/30',
        outline:
          'border-2 border-kkookk-orange-500 text-kkookk-orange-600 hover:bg-kkookk-orange-50 active:bg-kkookk-orange-100 focus:ring-kkookk-orange-500/30',
        ghost:
          'text-kkookk-orange-600 hover:bg-kkookk-orange-50 active:bg-kkookk-orange-100 focus:ring-kkookk-orange-500/30',
        danger:
          'bg-kkookk-red text-white hover:bg-kkookk-red-500 active:bg-kkookk-red-500 focus:ring-kkookk-red/30',
      },
      size: {
        sm: 'h-10 px-4 text-sm rounded-xl',
        md: 'h-14 px-6 text-base rounded-2xl',
        lg: 'h-16 px-8 text-lg rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
