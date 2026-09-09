import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <>
      <Container className="flex flex-col gap-3 pt-6 pb-4">
        <Skeleton className="h-4 w-64 max-w-full" />
      </Container>

      <Container className="grid grid-cols-1 gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-20 w-20 shrink-0" />
            <Skeleton className="h-20 w-20 shrink-0" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Container>
    </>
  );
}
