import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { siteConfig } from "@/constants/site";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Container className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-sm border border-beige bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="rounded-sm font-heading text-xl font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {siteConfig.name}
          </Link>
          <Heading variant="h2" as="h1" className="mt-2">
            {title}
          </Heading>
          {subtitle && (
            <Text variant="body" className="text-muted">
              {subtitle}
            </Text>
          )}
        </div>

        {children}

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </Container>
  );
}
