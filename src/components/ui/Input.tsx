import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, endAdornment, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-sm font-medium text-primary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={errorId}
          className={cn(
            "h-11 w-full rounded-sm border border-beige bg-white px-4 font-body text-sm text-primary placeholder:text-muted",
            "focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:border-error focus:ring-error",
            endAdornment ? "pr-11" : undefined,
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="font-body text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
});
