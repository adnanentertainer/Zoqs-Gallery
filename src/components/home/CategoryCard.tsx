import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-beige">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />
      </div>
      <div className="mt-3 flex flex-col items-center gap-0.5 text-center">
        <h3 className="font-heading text-base font-semibold text-primary transition-colors group-hover:text-gold">
          {category.name}
        </h3>
        <span className="font-body text-xs text-muted">
          {category.productCount} Products
        </span>
      </div>
    </Link>
  );
}
