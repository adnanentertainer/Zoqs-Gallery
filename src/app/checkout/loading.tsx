import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return (
    <Container className="flex flex-col gap-6 py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </Container>
  );
}
