"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { ProductLightbox } from "@/components/product/ProductLightbox";
import { useProductVariantImage } from "@/context/ProductVariantImageContext";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { variantImage } = useProductVariantImage();
  // True once the shopper has manually picked a base-product thumbnail while
  // a variant image was showing -- lets them browse the other photos without
  // the variant's photo snapping back on every render. A NEW variant pick
  // (color change) always takes over again, via the effect below.
  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    setManualOverride(false);
  }, [variantImage]);

  const showVariantImage = Boolean(variantImage) && !manualOverride;
  const mainImage = showVariantImage ? variantImage! : images[activeIndex];

  // One ordered list drives the main image, the thumbnail rail, and the
  // fullscreen viewer, so all three always agree on what's currently shown --
  // the variant's own photo (if any) leads, followed by the product's own
  // uploaded photos (with the variant's photo deduped out if it's a repeat).
  const displayImages = variantImage
    ? [variantImage, ...images.filter((image) => image !== variantImage)]
    : images;
  const displayActiveIndex = showVariantImage
    ? 0
    : displayImages.indexOf(images[activeIndex]);

  function selectThumbnail(index: number) {
    const clicked = displayImages[index];
    if (variantImage && clicked === variantImage) {
      setManualOverride(false);
      return;
    }
    setActiveIndex(images.indexOf(clicked));
    setManualOverride(true);
  }

  function openLightbox() {
    setLightboxIndex(displayActiveIndex);
    setIsLightboxOpen(true);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      <button
        type="button"
        onClick={openLightbox}
        aria-label={`View ${productName} image full screen`}
        className="group relative aspect-square w-full overflow-hidden rounded-sm bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <Image
          src={mainImage}
          alt={productName}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => selectThumbnail(index)}
              aria-label={`Show image ${index + 1} of ${displayImages.length}`}
              aria-current={index === displayActiveIndex}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:w-full",
                index === displayActiveIndex
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
        activeIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
