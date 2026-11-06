import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin";
import { Heading, Text } from "@/components/ui/Typography";
import { ColorThemeForm } from "@/components/admin/ColorThemeForm";
import { ColorThemeScheduleForm } from "@/components/admin/ColorThemeScheduleForm";
import {
  getAdminColorThemeId,
  getAdminColorThemeSchedule,
  getAdminTodayResolvedThemeId,
} from "@/lib/services/admin/adminColorThemeService";
import { getCurrentDayOfWeek } from "@/types/colorTheme";

export const metadata: Metadata = {
  title: "Color Theme | Admin | ZOQ's Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminThemePage() {
  const [activeThemeId, schedule, todayResolvedThemeId] = await Promise.all([
    getAdminColorThemeId(),
    getAdminColorThemeSchedule(),
    getAdminTodayResolvedThemeId(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Color Theme"
        description="Pick the storefront's palette -- applies site-wide the moment you save."
      />
      <ColorThemeForm
        initialThemeId={activeThemeId}
        liveThemeId={todayResolvedThemeId}
      />

      <div className="mt-4">
        <Heading variant="h3" as="h2">
          Day-of-Week Schedule
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          Optional -- automatically switch the theme on specific days (e.g. a
          different look for a weekend sale), without touching the picker above.
        </Text>
      </div>
      <ColorThemeScheduleForm
        initialSchedule={schedule}
        baseThemeId={activeThemeId}
        todayName={getCurrentDayOfWeek()}
      />
    </div>
  );
}
