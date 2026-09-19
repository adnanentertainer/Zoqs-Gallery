"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FestivalBanner } from "@/types/festivalBanner";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetTime: number): TimeLeft | null {
  const diff = targetTime - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function FestivalCountdownBar({ banner }: { banner: FestivalBanner }) {
  const targetTime = new Date(banner.targetAt as string).getTime();
  // Starts null so the server-rendered markup and the first client render
  // match exactly (avoids a hydration mismatch); the real countdown fills in
  // a tick later via the effect below.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => {
      const next = getTimeLeft(targetTime);
      setTimeLeft(next);
      if (!next) clearInterval(interval);
    };
    // Fires the first tick on a macrotask rather than calling setState
    // directly in the effect body, then ticks every second after that.
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [targetTime]);

  if (timeLeft === null) return null;

  return (
    <div className="bg-gold py-2.5 text-center">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 sm:px-6 lg:px-8">
        <p className="font-body text-xs font-medium tracking-wide text-white sm:text-sm">
          {banner.name ? `${banner.name} — ` : ""}
          {banner.message}
        </p>
        <p
          className="font-body text-xs font-semibold tabular-nums tracking-wide text-white sm:text-sm"
          aria-live="polite"
        >
          {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m{" "}
          {pad(timeLeft.seconds)}s
        </p>
        {banner.ctaLabel && banner.ctaHref && (
          <Link
            href={banner.ctaHref}
            className="font-body text-xs font-semibold underline underline-offset-2 hover:no-underline sm:text-sm"
          >
            {banner.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
