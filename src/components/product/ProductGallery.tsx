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
  const [isClickZoomed, setIsClickZoomed] = useState(false);
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

  // Hovering magnifies to 1.25x and follows the cursor; a click while
  // hovering locks it in at 1.6x until the shopper clicks anywhere else on
  // the page (a plain mouse-leave alone doesn't undo a click-triggered zoom).
  const zoomScale = isClickZoomed ? 1.6 : isHovering ? 1.25 : 1;

  function handleImageMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  // Switching photos (thumbnail, swatch, or lightbox) while locked into the
  // click-zoom shouldn't leave the next photo stuck zoomed in too.
  useEffect(() => {
    setIsClickZoomed(false);
  }, [activeIndex]);

  useEffect(() => {
    if (!isClickZoomed) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        imageContainerRef.current &&
        !imageContainerRef.current.contains(event.target as Node)
      ) {
        setIsClickZoomed(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isClickZoomed]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      <div
        ref={imageContainerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={handleImageMouseMove}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => setIsClickZoomed(true)}
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-sm bg-beige"
      >
        <Image
          src={mainImage}
          alt={productName}
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: zoomOrigin }}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsLightboxOpen(true);
          }}
          aria-label={`View ${productName} image full screen`}
          className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold group-hover:opacity-100"
        >
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </button>
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
