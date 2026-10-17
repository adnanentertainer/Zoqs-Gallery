"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  markWhatsAppStatusPostedAction,
  dismissWhatsAppStatusItemAction,
} from "@/app/admin/whatsapp-status/actions";
import type { WhatsAppStatusQueueItem } from "@/types/socialMedia";

const REASON_LABEL: Record<WhatsAppStatusQueueItem["reason"], string> = {
  new_product: "New Arrival",
  price_change: "Price Change",
};

export function WhatsAppStatusCard({
  item,
}: {
  item: WhatsAppStatusQueueItem;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard permission denied/unsupported -- the caption is still
      // visible and selectable in the textarea below, so this isn't fatal.
      setError("Couldn't copy automatically — select and copy the text below.");
    }
  }

  async function handleResolve(action: "posted" | "dismissed") {
    setIsSubmitting(true);
    setError(null);
    const result =
      action === "posted"
        ? await markWhatsAppStatusPostedAction(item.id)
        : await dismissWhatsAppStatusItemAction(item.id);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-beige bg-white p-5 sm:flex-row">
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-sm bg-beige sm:h-auto sm:w-40">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="(min-width: 640px) 160px, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.reason === "price_change" ? "gold" : "default"}>
            {REASON_LABEL[item.reason]}
          </Badge>
          <span className="font-body text-sm font-medium text-primary">
            {item.productName}
          </span>
        </div>

        <textarea
          readOnly
          value={item.caption}
          rows={4}
          onFocus={(event) => event.target.select()}
          className="w-full resize-none rounded-sm border border-beige bg-secondary/40 px-3 py-2 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold"
        />

        {error && <p className="font-body text-xs text-error">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy Caption
              </>
            )}
          </Button>

          {item.imageUrl && (
            <a
              href={item.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-sm border border-beige px-4 font-body text-sm font-medium text-primary transition-colors hover:border-gold/50 hover:bg-beige"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open Image
            </a>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleResolve("dismissed")}
            >
              Dismiss
            </Button>
            <Button
              type="button"
              variant="gold"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => handleResolve("posted")}
            >
              Mark as Posted
            </Button>
          </div>
        </div>

        <p className="font-body text-xs text-muted">
          Open the image on your phone (long-press or right-click to save),
          copy the caption, then post both to WhatsApp Status yourself —
          there&apos;s no official API to do this automatically.
        </p>
      </div>
    </div>
  );
}
