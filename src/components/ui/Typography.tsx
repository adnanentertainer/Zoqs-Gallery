import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingVariant = "display" | "h1" | "h2" | "h3";

const headingStyles: Record<HeadingVariant, string> = {
  display:
    "font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl",
  h1: "font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl",
  h2: "font-heading text-2xl font-semibold leading-snug tracking-tight sm:text-3xl lg:text-4xl",
  h3: "font-heading text-xl font-semibold leading-snug tracking-tight sm:text-2xl lg:text-3xl",
};

const headingTag: Record<HeadingVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

interface HeadingProps extends ComponentPropsWithoutRef<"h1"> {
  variant?: HeadingVariant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Heading({
  variant = "h2",
  as,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = as ?? headingTag[variant];
  return (
    <Tag className={cn(headingStyles[variant], className)} {...rest}>
      {children}
    </Tag>
  );
}

type TextVariant = "bodyLg" | "body" | "bodySm" | "caption" | "button";

const textStyles: Record<TextVariant, string> = {
  bodyLg: "font-body text-lg leading-relaxed",
  body: "font-body text-base leading-relaxed",
  bodySm: "font-body text-sm leading-relaxed",
  caption: "font-body text-xs uppercase tracking-wide text-muted",
  button: "font-body text-sm font-medium tracking-wide",
};

const textTag: Record<TextVariant, ElementType> = {
  bodyLg: "p",
  body: "p",
  bodySm: "p",
  caption: "span",
  button: "span",
};

interface TextProps extends ComponentPropsWithoutRef<"p"> {
  variant?: TextVariant;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Text({
  variant = "body",
  as,
  className,
  children,
  ...rest
}: TextProps) {
  const Tag = as ?? textTag[variant];
  return (
    <Tag className={cn(textStyles[variant], className)} {...rest}>
      {children}
    </Tag>
  );
}
