import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </Container>
      <Container className="pb-16">
        <div
          role="status"
          aria-label="Loading categories"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
