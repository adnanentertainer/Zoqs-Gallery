import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthMessageProps {
  variant: "error" | "success";
  message: string;
}

export function AuthMessage({ variant, message }: AuthMessageProps) {
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-sm border px-4 py-3 font-body text-sm",
        isError
          ? "border-error/30 bg-error/5 text-error"
          : "border-success/30 bg-success/5 text-success",
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  );
}
