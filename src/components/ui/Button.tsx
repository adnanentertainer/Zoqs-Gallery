import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-beige bg-secondary text-primary hover:bg-beige",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "text-primary hover:bg-beige",
  gold: "bg-gold text-white hover:bg-gold/90",
  danger: "bg-error text-white hover:bg-error/90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

/**
 * Shared visual classes for the Button variants. Exported so link-styled CTAs
 * (e.g. Next.js `Link`) can look identical to `<Button>` without nesting a
 * `<button>` inside an `<a>`, which is invalid HTML.
 */
export function buttonVariants(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-body font-medium tracking-wide transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={buttonVariants(variant, size, className)}
        {...props}
      >
        {isLoading ? <Spinner size="sm" className="text-current" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);
