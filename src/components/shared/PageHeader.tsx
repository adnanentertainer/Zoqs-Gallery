import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/components/navigation/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";

interface PageHeaderProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  subtitle?: string;
}

/** Shared breadcrumb + title + gold accent line used by the top-level
 * listing pages (Shop, Products, New Arrivals, Best Sellers) so the page
 * header looks the same wherever a shopper lands. */
export function PageHeader({ breadcrumb, title, subtitle }: PageHeaderProps) {
  return (
    <Container className="flex flex-col gap-3 pt-6 pb-8">
      <Breadcrumb items={breadcrumb} />
      <div className="flex flex-col gap-3">
        <Heading variant="h1" as="h1">
          {title}
        </Heading>
        <span aria-hidden="true" className="h-px w-12 bg-gold" />
      </div>
      {subtitle && (
        <Text variant="body" className="max-w-2xl text-muted">
          {subtitle}
        </Text>
      )}
    </Container>
  );
}
