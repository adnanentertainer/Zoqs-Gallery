import Link from "next/link";
import { Gem } from "lucide-react";
import { Heading, Text } from "@/components/ui/Typography";
import { buttonVariants } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-sm border border-beige bg-secondary/40 px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-gold">
        <Gem className="h-6 w-6" aria-hidden="true" />
      </span>
      <Heading variant="h3" as="h2">
        {title}
      </Heading>
      <Text variant="body" className="max-w-sm text-muted">
        {description}
      </Text>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          onClick={onActionClick}
          className={buttonVariants("outline", "md")}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
