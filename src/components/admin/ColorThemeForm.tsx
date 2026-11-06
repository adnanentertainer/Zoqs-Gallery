"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { cn } from "@/lib/utils";
import { COLOR_THEMES, type ColorTheme } from "@/types/colorTheme";
import { updateAdminColorThemeAction } from "@/app/admin/theme/actions";

interface ColorThemeFormProps {
  initialThemeId: string;
  /** What's actually live on the storefront right now -- may differ from
   * initialThemeId if a day-of-week schedule override is winning today
   * (see ColorThemeScheduleForm). Tracked separately from savedId so the
   * "Currently Live" badge stays honest: saving a new base theme while an
   * override is active for today doesn't make the badge jump to it, since
   * the override still wins until that day's override is cleared. */
  liveThemeId: string;
}

export function ColorThemeForm({
  initialThemeId,
  liveThemeId,
}: ColorThemeFormProps) {
  const [selectedId, setSelectedId] = useState(initialThemeId);
  const [savedId, setSavedId] = useState(initialThemeId);
  const [currentlyLiveId, setCurrentlyLiveId] = useState(liveThemeId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = selectedId !== savedId;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !isDirty) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminColorThemeAction(selectedId);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // The base theme only becomes "live" immediately if no schedule
    // override was already winning today -- otherwise the override still
    // wins, and this save only changed what tomorrow (or any
    // unscheduled day) falls back to.
    if (currentlyLiveId === savedId) {
      setCurrentlyLiveId(selectedId);
    }
    setSavedId(selectedId);
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {error && <AuthMessage variant="error" message={error} />}
      {success && (
        <AuthMessage
          variant="success"
          message="Color theme saved -- live on the storefront now."
        />
      )}

      <div
        role="radiogroup"
        aria-label="Storefront color theme"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {COLOR_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedId === theme.id}
            isLive={currentlyLiveId === theme.id}
            onSelect={() => {
              setSelectedId(theme.id);
              setSuccess(false);
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-beige pt-5">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-fit"
          isLoading={isSubmitting}
          disabled={!isDirty}
        >
          {isDirty ? "Save & Apply Theme" : "Theme Saved"}
        </Button>
        {isDirty && (
          <span className="font-body text-xs text-muted">
            Not applied yet -- pick is just a preview until you save.
          </span>
        )}
      </div>
    </form>
  );
}

function ThemeCard({
  theme,
  isSelected,
  isLive,
  onSelect,
}: {
  theme: ColorTheme;
  isSelected: boolean;
  isLive: boolean;
  onSelect: () => void;
}) {
  const t = theme.tokens;

  return (
    <label
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        isSelected
          ? "border-gold shadow-lg ring-2 ring-gold"
          : "border-beige hover:border-gold/50 hover:shadow-md",
      )}
    >
      <input
        type="radio"
        name="color-theme"
        value={theme.id}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />

      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-[15px] font-semibold text-primary">
            {theme.name}
          </span>
          {isLive && (
            <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-gold">
              Currently live
            </span>
          )}
        </div>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            isSelected
              ? "border-gold bg-gold text-white"
              : "border-beige bg-white text-transparent",
          )}
          aria-hidden="true"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      </div>

      <p className="px-4 pb-3 pt-1.5 font-body text-xs leading-relaxed text-muted">
        {theme.mood}
      </p>

      {/* Live mini preview, rendered in the theme's own colors */}
      <div
        className="mx-4 mb-3 flex flex-col gap-2 rounded-xl p-3"
        style={{ background: t.secondary }}
      >
        <span
          className="w-fit rounded-full px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-wide"
          style={{
            color: t.accent,
            backgroundColor: `color-mix(in srgb, ${t.accent} 14%, ${t.secondary})`,
            border: `1px solid color-mix(in srgb, ${t.accent} 35%, ${t.secondary})`,
          }}
        >
          Wedding Pick
        </span>
        <span
          className="font-heading text-[13px] font-semibold leading-snug"
          style={{ color: t.primary }}
        >
          Jewellery That Completes Your Story
        </span>
        <span
          className="w-fit rounded-md px-3 py-1 font-body text-[10px] font-semibold"
          style={{ background: t.accent, color: t.secondary }}
        >
          Shop New Arrivals
        </span>
      </div>

      <div className="flex border-t border-beige">
        {(["primary", "secondary", "accent", "beige", "muted"] as const).map(
          (key) => (
            <span
              key={key}
              className="h-5 flex-1"
              style={{ background: t[key] }}
              title={`${key}: ${t[key]}`}
            />
          ),
        )}
      </div>
    </label>
  );
}
