import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function OrderConfirmationLoading() {
  return (
    <Container className="py-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </Container>
  );
}
