"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

const navButtonStyles =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

interface ProductLightboxProps {
  images: string[];
  productName: string;
  activeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ProductLightbox({
  images,
  productName,
  activeIndex,
  isOpen,
  onClose,
  onIndexChange,
}: ProductLightboxProps) {
  useEscapeKey(isOpen, onClose);
  useBodyScrollLock(isOpen);

  const showPrevious = () =>
    onIndexChange((activeIndex - 1 + images.length) % images.length);
  const showNext = () => onIndexChange((activeIndex + 1) % images.length);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex, images.length]);

  return (
    <div className={cn("fixed inset-0 z-50", !isOpen && "pointer-events-none")}>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-primary/90 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} image viewer`}
        aria-hidden={!isOpen}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          tabIndex={isOpen ? 0 : -1}
          className={cn(navButtonStyles, "absolute right-4 top-4")}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {images.length > 1 && (
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous image"
            tabIndex={isOpen ? 0 : -1}
            className={cn(
              navButtonStyles,
              "absolute left-2 top-1/2 -translate-y-1/2 sm:left-4",
            )}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        )}

        <div className="relative h-[70vh] w-[92vw] max-w-3xl sm:h-[80vh]">
          <Image
            src={images[activeIndex]}
            alt={`${productName} — image ${activeIndex + 1} of ${images.length}`}
            fill
            sizes="92vw"
            className="object-contain"
            priority={isOpen}
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={showNext}
            aria-label="Next image"
            tabIndex={isOpen ? 0 : -1}
            className={cn(
              navButtonStyles,
              "absolute right-2 top-1/2 -translate-y-1/2 sm:right-4",
            )}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        )}

        {images.length > 1 && (
          <span className="absolute bottom-4 font-body text-sm text-white/80">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
