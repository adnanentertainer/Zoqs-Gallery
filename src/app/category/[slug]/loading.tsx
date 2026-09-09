import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function CategoryLoading() {
  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-6">
        <Skeleton className="h-4 w-52" />
      </Container>
      <Skeleton className="h-48 w-full sm:h-64" />
      <Container className="py-10">
        <ProductGridSkeleton />
      </Container>
    </>
  );
}
