import type { ReactNode } from "react";
import { Heading, Text } from "@/components/ui/Typography";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Heading variant="h2" as="h1">
          {title}
        </Heading>
        {description && (
          <Text variant="bodySm" className="mt-1 text-muted">
            {description}
          </Text>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
