import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";

type SectionBackground = "white" | "cream" | "beige";

const backgroundStyles: Record<SectionBackground, string> = {
  white: "bg-white",
  cream: "bg-secondary",
  beige: "bg-beige",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  background?: SectionBackground;
  containerClassName?: string;
  children: ReactNode;
}

export function Section({
  title,
  subtitle,
  background = "white",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-12 sm:py-16 lg:py-24",
        backgroundStyles[background],
        className,
      )}
      {...props}
    >
      <Container className={containerClassName}>
        {(title ?? subtitle) && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-12">
            {title && <Heading variant="h2">{title}</Heading>}
            {subtitle && (
              <Text variant="bodyLg" className="max-w-2xl text-muted">
                {subtitle}
              </Text>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
