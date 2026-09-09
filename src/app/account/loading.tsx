import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <Container className="flex flex-col gap-8 py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </Container>
  );
}
