"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { ProductLightbox } from "@/components/product/ProductLightbox";
import { useProductVariantSelection } from "@/context/ProductVariantImageContext";
import { cn } from "@/lib/utils";
import type { ProductVariantGroup } from "@/types";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  variants?: ProductVariantGroup[];
}

interface VariantThumbnail {
  image: string;
  groupType: string;
  value: string;
}

export function ProductGallery({
  images,
  productName,
  variants,
}: ProductGalleryProps) {
  const { selections, setSelections } = useProductVariantSelection();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");

  // Every variant that has its own photo (e.g. each color option) gets a
  // permanent thumbnail, in addition to the product's own uploaded photos --
  // not just whichever one happens to be selected -- so a shopper can see
  // every option at a glance before picking one.
  const variantThumbs = useMemo(() => {
    const seen = new Set(images);
    const thumbs: VariantThumbnail[] = [];
    for (const group of variants ?? []) {
      for (const option of group.options) {
        if (option.image && !seen.has(option.image)) {
          seen.add(option.image);
          thumbs.push({
            image: option.image,
            groupType: group.type,
            value: option.value,
          });
        }
      }
    }
    return thumbs;
  }, [variants, images]);

  const displayImages = useMemo(
    () => [...images, ...variantThumbs.map((thumb) => thumb.image)],
    [images, variantThumbs],
  );

  // Picking a color swatch in ProductActions should jump the gallery to that
  // variant's own photo. Browsing thumbnails manually (below) doesn't feed
  // back into `selections`, so this only reacts to the swatches themselves.
  useEffect(() => {
    for (const thumb of variantThumbs) {
      if (selections[thumb.groupType] === thumb.value) {
        const index = displayImages.indexOf(thumb.image);
        if (index !== -1) setActiveIndex(index);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections]);

  const mainImage = displayImages[activeIndex] ?? images[0];

  function selectThumbnail(index: number) {
    setActiveIndex(index);
    const image = displayImages[index];
    const thumb = variantThumbs.find((t) => t.image === image);
    if (thumb) {
      setSelections((prev) => ({ ...prev, [thumb.groupType]: thumb.value }));
    }
  }

  // Hovering magnifies to 1.35x in place, following the cursor; clicking
  // opens the full photo as a popup (the lightbox) instead of zooming further.
  const zoomScale = isHovering ? 1.35 : 1;

  function handleImageMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col gap-4 self-start lg:flex-row-reverse">
      <div
        ref={imageContainerRef}
        role="button"
        tabIndex={0}
        aria-label={`View ${productName} image full screen`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={handleImageMouseMove}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => setIsLightboxOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsLightboxOpen(true);
          }
        }}
        className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-sm bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <Image
          src={mainImage}
          alt={productName}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: zoomOrigin }}
        />
        <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => selectThumbnail(index)}
              aria-label={`Show image ${index + 1} of ${displayImages.length}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:w-full",
                index === activeIndex
                  ? "border-gold"
                  : "border-transparent hover:border-beige",
              )}
            >
              <Image
                src={image}
                alt=""
                aria-hidden="true"
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <ProductLightbox
        images={displayImages}
        productName={productName}
        activeIndex={activeIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </div>
  );
}
