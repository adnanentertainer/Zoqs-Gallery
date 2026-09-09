import { Skeleton } from "@/components/ui/Skeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
