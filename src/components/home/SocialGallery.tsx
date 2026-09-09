import Image from "next/image";
import { InstagramIcon } from "@/components/icons/social-icons";
import { Section } from "@/components/ui/Section";
import { socialPosts } from "@/data/social";

export function SocialGallery() {
  return (
    <Section
      title="Follow Our Style"
      subtitle="Follow ZOQ's Gallery for daily inspiration and new arrivals."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {socialPosts.map((post) => (
          <a
            key={post.id}
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View this look on Instagram"
            className="group relative aspect-square overflow-hidden rounded-sm bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
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
              <InstagramIcon
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
