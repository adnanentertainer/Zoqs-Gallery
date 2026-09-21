import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  "default" | "gold" | "success" | "error" | "outline" | "warning";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-beige text-primary",
  gold: "bg-gold text-white",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  outline: "border border-primary bg-transparent text-primary",
  warning: "border border-gold bg-transparent text-gold",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 font-body text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
