"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/Typography";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(open, onCancel);
  useBodyScrollLock(open);

  useEffect(() => {
    if (open) cancelButtonRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onCancel}
        aria-hidden="true"
        className="absolute inset-0 bg-primary/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-sm rounded-sm bg-white p-6 shadow-xl"
      >
        <Heading variant="h3" as="h2" id="confirm-dialog-title">
          {title}
        </Heading>
        <Text
          id="confirm-dialog-description"
          variant="bodySm"
          className="mt-2 text-muted"
        >
          {description}
        </Text>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
