import type { LucideIcon } from "lucide-react";
import { Text } from "@/components/ui/Typography";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-sm border border-beige bg-white p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <Text variant="caption">{label}</Text>
        <p className="font-heading text-2xl font-semibold text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}
