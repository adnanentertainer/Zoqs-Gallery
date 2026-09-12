"use client";

import { useState } from "react";
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
  // The selected variant's own photo (e.g. the Silver bangle instead of Gold)
  // takes over the main preview, while thumbnails stay on the base product
  // photos -- switching color shouldn't reshuffle the whole gallery.
  const mainImage = variantImage || images[activeIndex];

  // The fullscreen viewer needs to include the variant's own photo too --
  // otherwise "expanding" it while a variant is selected would pop open the
  // lightbox on a completely different (base) photo instead of the one on
  // screen. Put the currently-shown photo first so the viewer opens on it.
  const lightboxImages = variantImage
    ? [mainImage, ...images.filter((image) => image !== mainImage)]
    : images;

  function openLightbox() {
    setLightboxIndex(variantImage ? 0 : activeIndex);
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

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
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
        images={lightboxImages}
        productName={productName}
        activeIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
