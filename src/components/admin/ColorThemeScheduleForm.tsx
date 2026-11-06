"use client";

import { useState, type FormEvent } from "react";
import { AuthMessage } from "@/components/auth";
import { Button } from "@/components/ui/Button";
import {
  COLOR_THEMES,
  DAYS_OF_WEEK,
  getColorThemeById,
  type ColorThemeSchedule,
  type DayOfWeek,
} from "@/types/colorTheme";
import { updateAdminColorThemeScheduleAction } from "@/app/admin/theme/actions";

const DAY_LABELS: Record<DayOfWeek, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

interface ColorThemeScheduleFormProps {
  initialSchedule: ColorThemeSchedule;
  /** The base theme's id (the one the picker above controls) -- used, not
   * just its name, so the "live theme right now" preview below can
   * re-resolve live as the admin edits, before saving. */
  baseThemeId: string;
  todayName: DayOfWeek;
}

export function ColorThemeScheduleForm({
  initialSchedule,
  baseThemeId,
  todayName,
}: ColorThemeScheduleFormProps) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseThemeName = getColorThemeById(baseThemeId).name;
  // Mirrors resolveScheduledThemeId()'s logic using today's name already
  // resolved server-side (Asia/Karachi) -- reusing that instead of
  // re-deriving "today" from the browser's own clock/timezone, which could
  // disagree with the server near midnight or on a misconfigured device.
  const previewThemeId = schedule.enabled
    ? (schedule.days[todayName] ?? baseThemeId)
    : baseThemeId;
  const previewThemeName = getColorThemeById(previewThemeId).name;

  function setDay(day: DayOfWeek, themeId: string | null) {
    setSchedule((prev) => ({
      ...prev,
      days: { ...prev.days, [day]: themeId },
    }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminColorThemeScheduleAction(schedule);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-2xl flex-col gap-4 rounded-sm border border-beige bg-white p-6"
    >
      {error && <AuthMessage variant="error" message={error} />}
      {success && (
        <AuthMessage
          variant="success"
          message="Schedule saved -- live on the storefront now."
        />
      )}

      <label className="flex items-center gap-2 font-body text-sm text-primary">
        <input
          type="checkbox"
          checked={schedule.enabled}
          onChange={(event) => {
            setSchedule((prev) => ({ ...prev, enabled: event.target.checked }));
            setSuccess(false);
          }}
          className="h-4 w-4 accent-gold"
        />
        Rotate the color theme by day of week
      </label>
      <p className="font-body text-xs text-muted">
        Any day left on &quot;Use Default&quot; falls back to the theme picked
        above ({baseThemeName}) -- a day only needs an entry here if it should
        look different. Days follow Pakistan time, not the visitor&apos;s own
        clock.
      </p>

      <div
        className={
          schedule.enabled
            ? "flex flex-col gap-2 border-t border-beige pt-4"
            : "flex flex-col gap-2 border-t border-beige pt-4 opacity-50"
        }
      >
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="flex items-center justify-between gap-3">
            <span className="font-body text-sm text-primary">
              {DAY_LABELS[day]}
              {day === todayName && (
                <span className="ml-2 font-body text-[10px] font-semibold uppercase tracking-wide text-gold">
                  Today
                </span>
              )}
            </span>
            <select
              disabled={!schedule.enabled}
              value={schedule.days[day] ?? ""}
              onChange={(event) =>
                setDay(
                  day,
                  event.target.value === "" ? null : event.target.value,
                )
              }
              className="rounded-sm border border-beige bg-white px-3 py-1.5 font-body text-sm text-primary disabled:cursor-not-allowed"
            >
              <option value="">Use Default ({baseThemeName})</option>
              {COLOR_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <p className="rounded-sm bg-secondary px-3 py-2 font-body text-xs text-muted">
        Today is{" "}
        <strong className="text-primary">{DAY_LABELS[todayName]}</strong> --
        {schedule.enabled === initialSchedule.enabled &&
        schedule.days[todayName] === initialSchedule.days[todayName] ? (
          <>
            {" "}
            the live theme right now is{" "}
            <strong className="text-primary">{previewThemeName}</strong>.
          </>
        ) : (
          <>
            {" "}
            saving now would make today&apos;s live theme{" "}
            <strong className="text-primary">{previewThemeName}</strong> (not
            saved yet).
          </>
        )}
      </p>

      <div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-fit"
          isLoading={isSubmitting}
        >
          Save Schedule
        </Button>
      </div>
    </form>
  );
}
