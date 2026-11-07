import Image from "next/image";
import { InstagramIcon } from "@/components/icons/social-icons";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";
import type { SocialPost } from "@/types";
import type { SocialGalleryLayoutId } from "@/types/layoutTemplate";

interface SocialGalleryProps {
  posts: SocialPost[];
  /** Which of the admin-selected layout variants to render -- see
   * src/types/layoutTemplate.ts. Defaults to the original "grid" look. */
  layout?: SocialGalleryLayoutId;
}

export function SocialGallery({ posts, layout = "grid" }: SocialGalleryProps) {
  if (posts.length === 0) return null;

  return (
    <Section
      title="Follow Our Style"
      subtitle="Follow ZOQ's Gallery for daily inspiration and new arrivals."
    >
      {layout === "carousel" && (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="w-28 shrink-0 snap-start sm:w-36 lg:w-44"
            >
              <SocialTile post={post} />
            </div>
          ))}
        </div>
      )}

      {layout === "mosaic" && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={index === 0 ? "col-span-2 row-span-2" : undefined}
            >
              <SocialTile post={post} />
            </div>
          ))}
        </div>
      )}

      {layout === "banner" && posts[0] && (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-beige">
            <SocialTile post={posts[0]} fill />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
            {posts.slice(1, 7).map((post) => (
              <SocialTile key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {layout === "circles" && (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View this look on Instagram"
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gold via-maroon to-gold p-[2.5px] transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-24"
            >
              <span className="relative block h-full w-full overflow-hidden rounded-full border-2 border-white">
                <Image
                  src={post.image}
                  alt={post.alt}
                  fill
                  sizes="96px"
                  loading="lazy"
                  className="object-cover"
                />
              </span>
            </a>
          ))}
        </div>
      )}

      {layout === "grid" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {posts.map((post) => (
            <SocialTile key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center sm:mt-10">
        <a
          href={siteConfig.socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-sm font-body text-sm font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <InstagramIcon
            className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
          Follow Us on Instagram
        </a>
      </div>
    </Section>
  );
}

function SocialTile({
  post,
  fill = false,
}: {
  post: SocialPost;
  fill?: boolean;
}) {
  return (
    <a
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View this look on Instagram"
      className={cn(
        "group block overflow-hidden rounded-2xl bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        fill ? "absolute inset-0" : "relative aspect-square",
      )}
    >
      <Image
        src={post.image}
        alt={post.alt}
        fill
        loading="lazy"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition-all duration-300 group-hover:bg-primary/40 group-hover:opacity-100">
        <InstagramIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
    </a>
  );
}
