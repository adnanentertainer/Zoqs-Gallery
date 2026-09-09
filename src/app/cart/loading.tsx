import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <Container className="flex flex-col gap-6 py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    </Container>
  );
}
