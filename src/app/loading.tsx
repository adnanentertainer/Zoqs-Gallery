import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function HomeLoading() {
  return (
    <>
      <section className="relative overflow-hidden bg-secondary lg:min-h-[85vh]">
        <Container className="grid grid-cols-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="order-2 hidden justify-center lg:flex">
            <Skeleton className="aspect-[4/5] w-full max-w-md" />
          </div>
          <div className="order-1 flex flex-col items-center gap-5 lg:items-start">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-8 py-12 sm:py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col gap-8 py-12 sm:py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <ProductGridSkeleton count={4} />
      </Container>
    </>
  );
}
