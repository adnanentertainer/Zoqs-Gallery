import type { BadgeVariant } from "@/components/ui/Badge";
import type { SocialPlatformStatus } from "@/types/socialMedia";

const STATUS_LABELS: Record<SocialPlatformStatus, string> = {
  pending: "Pending",
  success: "Posted",
  failed: "Failed",
  skipped: "Skipped",
};

const STATUS_VARIANTS: Record<SocialPlatformStatus, BadgeVariant> = {
  pending: "outline",
  success: "success",
  failed: "error",
  skipped: "default",
};

export function socialPostStatusLabel(status: SocialPlatformStatus): string {
  return STATUS_LABELS[status];
}

export function socialPostStatusVariant(
  status: SocialPlatformStatus,
): BadgeVariant {
  return STATUS_VARIANTS[status];
}
