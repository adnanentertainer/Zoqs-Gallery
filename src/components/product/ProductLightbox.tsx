"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

const navButtonStyles =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

// Always opens fit-to-box (nothing pre-cropped or pre-zoomed) — the shopper
// can wheel-zoom in or out from there, between MIN_ZOOM and MAX_ZOOM, to
// inspect detail or pull back out. The viewport this renders into is a real
// scrollable area (not a CSS transform clipped by overflow-hidden), so once
// zoomed in past fit, whatever that pushes outside the visible box is still
// reachable by scrolling/dragging rather than being permanently cropped off.
const BASE_ZOOM = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.5;
const ZOOM_SENSITIVITY = 0.0015;

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
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Each photo (and each time the viewer reopens) starts back at the same
  // base magnification rather than wherever the shopper last zoomed to.
  // Adjusted during render (React's recommended pattern for "reset state
  // when an input changes") rather than in an effect, which would cause an
  // extra, avoidable re-render on every photo/open-state change.
  const resetKey = `${activeIndex}:${isOpen}`;
  const [previousResetKey, setPreviousResetKey] = useState(resetKey);
  if (resetKey !== previousResetKey) {
    setPreviousResetKey(resetKey);
    setZoom(BASE_ZOOM);
  }

  // The zoomed photo is larger than its viewport (see the sizing below), so
  // it's a real scrollable area rather than a CSS transform clipped by
  // `overflow-hidden` — that older approach made the photo's edges (e.g. the
  // top of a close-up portrait) permanently unreachable once zoomed past fit.
  // Centering here keeps the zoomed-in view framed the same way regardless
  // of zoom level; scrolling/dragging from there reaches every edge.
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }, [zoom, activeIndex, isOpen]);

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
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous - event.deltaY * ZOOM_SENSITIVITY)),
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
          ref={scrollViewportRef}
          onClick={closeOnBackgroundClick}
          onWheel={handleWheelZoom}
          className="flex h-[70vh] w-[92vw] max-w-3xl items-center justify-center overflow-auto sm:h-[80vh]"
        >
          <div
            className="relative shrink-0 transition-[width,height] duration-150 ease-out"
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
            }}
          >
            <Image
              src={images[activeIndex]}
              alt={`${productName} — image ${activeIndex + 1} of ${images.length}`}
              fill
              sizes="92vw"
              className="object-contain"
              preload={isOpen}
            />
          </div>
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
