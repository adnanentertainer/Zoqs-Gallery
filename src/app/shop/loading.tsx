import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function ShopLoading() {
  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </Container>
      <Container className="pb-16">
        <ProductGridSkeleton />
      </Container>
    </>
  );
}
