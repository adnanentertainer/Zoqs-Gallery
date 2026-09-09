import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function SearchLoading() {
  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <ProductGridSkeleton />
    </Container>
  );
}
