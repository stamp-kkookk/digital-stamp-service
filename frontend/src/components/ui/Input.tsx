/**
 * Input 컴포넌트
 * KKOOKK 디자인 시스템을 따르는 폼 입력 컴포넌트
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-kkookk-navy mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex w-full rounded-xl border border-slate-200 bg-white',
              'p-4 text-base text-kkookk-navy placeholder:text-slate-400',
              'shadow-md shadow-slate-200/60',
              'focus:border-kkookk-orange-500 focus:outline-none focus:ring-0 focus:shadow-lg',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all',
              icon && 'pl-10',
              error && 'border-kkookk-red focus:border-kkookk-red',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-kkookk-red">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
