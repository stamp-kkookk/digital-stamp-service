import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-kkookk-steel-100 text-kkookk-steel-400',
        success: 'bg-kkookk-green-50 text-kkookk-green-500',
        warning: 'bg-kkookk-amber-50 text-kkookk-amber-500',
        danger: 'bg-kkookk-red-50 text-kkookk-red-500',
        info: 'bg-kkookk-indigo-50 text-kkookk-indigo',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
