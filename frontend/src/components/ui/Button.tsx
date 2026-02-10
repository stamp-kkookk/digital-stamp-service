/**
 * Button 컴포넌트
 * KKOOKK 디자인 시스템을 따르는 다양한 변형을 가진 기본 버튼 컴포넌트
 */

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl",
    "text-base font-bold transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kkookk-orange-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:bg-gray-300 disabled:text-white disabled:shadow-none",
    "active:scale-95",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-kkookk-orange-500 text-white",
          "hover:bg-kkookk-orange-600",
          "shadow-lg shadow-orange-200",
        ],
        secondary: [
          "bg-kkookk-indigo text-white",
          "hover:bg-blue-700",
          "shadow-lg shadow-blue-200",
        ],
        navy: [
          "bg-kkookk-navy text-white",
          "hover:bg-slate-800",
          "shadow-lg shadow-slate-200",
        ],
        outline: [
          "border-2 border-kkookk-orange-500 text-kkookk-orange-600",
          "hover:bg-kkookk-orange-50",
        ],
        ghost: ["text-kkookk-orange-600", "hover:bg-kkookk-orange-50"],
        destructive: [
          "bg-kkookk-red text-white",
          "hover:bg-red-700",
          "shadow-lg shadow-red-200",
        ],
        link: ["text-kkookk-orange-500 underline-offset-4", "hover:underline"],
        subtle: [
          "bg-slate-100 text-kkookk-steel",
          "hover:bg-slate-200 hover:text-kkookk-navy",
        ],
      },
      size: {
        default: "h-14 px-6",
        sm: "h-10 px-4 text-sm rounded-xl",
        lg: "h-16 px-8 text-lg",
        icon: "h-10 w-10 rounded-xl",
        full: "h-14 px-6 w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
