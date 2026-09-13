"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

const navButtonStyles =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

// Opens already magnified 1.5x (50%), and the shopper can scroll/pinch to
// zoom in further, up to MAX_ZOOM -- clamped so it can never zoom back out
// past the starting point, which is already closer than a plain fit-to-screen.
//
// On narrow (mobile) viewports the photo box is width-constrained rather
// than height-constrained (portrait product photos fill the available
// width with little to no letterboxing), so there's no slack left to
// absorb a forced zoom -- opening pre-zoomed there clipped real image
// content off both sides instead of just eating empty letterbox space
// like it does on wider screens. Mobile opens at 1x (the full photo,
// nothing cropped) and can still be zoomed in further from there.
const BASE_ZOOM = 1.5;
const MOBILE_BASE_ZOOM = 1;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 639px)";
const MAX_ZOOM = 3.5;
const ZOOM_SENSITIVITY = 0.0015;

function subscribeToMobileViewport(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getIsMobileViewport(): boolean {
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}

function getIsMobileViewportServerSnapshot(): boolean {
  return false;
}

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
  const [zoom, setZoom] = useState(BASE_ZOOM);
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    getIsMobileViewportServerSnapshot,
  );

  const baseZoom = isMobileViewport ? MOBILE_BASE_ZOOM : BASE_ZOOM;

  // Each photo (and each time the viewer reopens) starts back at the same
  // base magnification rather than wherever the shopper last zoomed to.
  useEffect(() => {
    setZoom(baseZoom);
  }, [activeIndex, isOpen, baseZoom]);

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

  // Scrolling/pinching while over the photo zooms just the photo -- this
  // preventDefault keeps the gesture from also scrolling or zooming the
  // browser page behind the viewer.
  function handleWheelZoom(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setZoom((previous) =>
      Math.min(MAX_ZOOM, Math.max(baseZoom, previous - event.deltaY * ZOOM_SENSITIVITY)),
    );
  }

  // A click that lands directly on this element's own background (not on
  // the photo or a button nested inside it) closes the viewer -- i.e.
  // clicking beside the image, at any point in the dialog, dismisses it.
  function closeOnBackgroundClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={cn("fixed inset-0 z-50", !isOpen && "pointer-events-none")}>
      <div
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
        onClick={closeOnBackgroundClick}
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

        <div
          onClick={closeOnBackgroundClick}
          onWheel={handleWheelZoom}
          className="relative h-[70vh] w-[92vw] max-w-3xl overflow-hidden sm:h-[80vh]"
        >
          <Image
            src={images[activeIndex]}
            alt={`${productName} — image ${activeIndex + 1} of ${images.length}`}
            fill
            sizes="92vw"
            className="object-contain transition-transform duration-150 ease-out"
            style={{ transform: `scale(${zoom})` }}
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
