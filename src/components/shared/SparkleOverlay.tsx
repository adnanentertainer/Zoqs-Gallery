import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SparkleSpot {
  position: string;
  delay: string;
  duration: string;
}

/** "sm" sits over small uppercase nav text; "lg" sits over a large heading
 * (e.g. the homepage banner title) and uses bigger icons/offsets to match. */
const SIZE_CONFIG: Record<"sm" | "lg", { icon: string; spots: SparkleSpot[] }> = {
  sm: {
    icon: "h-2.5 w-2.5",
    spots: [
      { position: "-top-1.5 -left-1.5", delay: "0s", duration: "2.2s" },
      { position: "-top-2 left-1/2 -translate-x-1/2", delay: "0.7s", duration: "2.6s" },
      { position: "-bottom-1.5 -right-1.5", delay: "1.3s", duration: "2.4s" },
    ],
  },
  lg: {
    icon: "h-5 w-5 sm:h-6 sm:w-6",
    spots: [
      { position: "-top-3 -left-4 sm:-top-4 sm:-left-5", delay: "0s", duration: "2.6s" },
      { position: "-top-4 left-1/3 sm:-top-5", delay: "0.8s", duration: "3s" },
      { position: "-bottom-3 -right-4 sm:-bottom-4 sm:-right-5", delay: "1.5s", duration: "2.8s" },
    ],
  },
};

interface SparkleOverlayProps {
  size?: "sm" | "lg";
  className?: string;
}

/** Twinkling gold stars laid directly over a piece of text — the parent
 * element must be `relative` (and sized to the text, e.g. `inline-block`)
 * so these sit tight over the words rather than scattered across a wider
 * box. Transparent background by design: just the stars, no pill/box. */
export function SparkleOverlay({ size = "sm", className }: SparkleOverlayProps) {
  const config = SIZE_CONFIG[size];

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {config.spots.map((spot, index) => (
        <Sparkle
          key={index}
          fill="currentColor"
          className={cn(
            "absolute animate-sparkle-twinkle text-gold drop-shadow-[0_0_3px_rgba(138,106,36,0.55)]",
            config.icon,
            spot.position,
          )}
          style={{
            animationDelay: spot.delay,
            animationDuration: spot.duration,
          }}
        />
      ))}
    </span>
  );
}
