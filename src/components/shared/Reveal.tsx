"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fades a section up into view the first time it scrolls near the
 * viewport -- a one-time entrance, not a repeating effect, so it reads as
 * a premium touch rather than a distraction. Starts hidden (matches
 * server-rendered output, so there's no hydration mismatch).
 *
 * Deliberately NOT IntersectionObserver-based: that only fires on a
 * genuine enter/exit transition, and testing found real cases -- a fast
 * scroll (or a large instant jump, e.g. a Page Down or an anchor-link
 * scroll) landing such that a section's entire transit through the
 * viewport happens between two of the browser's own internal intersection
 * checks -- where it never fires at all, leaving the section permanently
 * invisible. Checking the element's own position directly on scroll/resize
 * has no such gap: it reads the element's *current* position, so it
 * correctly reveals content that was scrolled straight past just as
 * reliably as content scrolled into slowly. rAF-throttled so the
 * (read-only) layout check runs at most once per frame.
 */
export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const node = ref.current;
    if (!node) return;

    let frame: number | null = null;

    function checkPosition() {
      frame = null;
      if (node!.getBoundingClientRect().top < window.innerHeight - 80) {
        setIsVisible(true);
      }
    }

    function onScrollOrResize() {
      if (frame === null) frame = requestAnimationFrame(checkPosition);
    }

    checkPosition();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [isVisible]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
