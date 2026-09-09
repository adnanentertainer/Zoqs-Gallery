"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        endAdornment={
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="rounded-sm p-2 text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        }
      />
    );
  },
);
