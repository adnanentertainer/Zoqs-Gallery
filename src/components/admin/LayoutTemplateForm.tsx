"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { Heading, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import {
  BENEFITS_LAYOUTS,
  BRIDAL_LAYOUTS,
  CATEGORY_LAYOUTS,
  HERO_LAYOUTS,
  PRODUCT_LAYOUTS,
  REVIEWS_LAYOUTS,
  SOCIAL_GALLERY_LAYOUTS,
  type BenefitsLayoutId,
  type BridalLayoutId,
  type CategoryLayoutId,
  type HeroLayoutId,
  type LayoutTemplate,
  type LayoutVariantOption,
  type ProductLayoutId,
  type ReviewsLayoutId,
  type SocialGalleryLayoutId,
} from "@/types/layoutTemplate";
import { updateAdminLayoutTemplateAction } from "@/app/admin/layout-template/actions";

interface LayoutTemplateFormProps {
  initialTemplate: LayoutTemplate;
}

const SECTION_KEYS = [
  "hero",
  "categories",
  "products",
  "bridal",
  "benefits",
  "reviews",
  "socialGallery",
] as const satisfies readonly (keyof LayoutTemplate)[];

export function LayoutTemplateForm({
  initialTemplate,
}: LayoutTemplateFormProps) {
  const [selected, setSelected] = useState(initialTemplate);
  const [saved, setSaved] = useState(initialTemplate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = SECTION_KEYS.some((key) => selected[key] !== saved[key]);

  function setSection<Key extends keyof LayoutTemplate>(
    key: Key,
    value: LayoutTemplate[Key],
  ) {
    setSelected((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !isDirty) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAdminLayoutTemplateAction(selected);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(selected);
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
      {error && <AuthMessage variant="error" message={error} />}
      {success && (
        <AuthMessage
          variant="success"
          message="Layout saved -- live on the storefront now."
        />
      )}

      <SectionPicker
        title="Hero Section"
        description="The first thing visitors see at the top of the homepage."
        name="hero-layout"
        options={HERO_LAYOUTS}
        selectedId={selected.hero}
        onSelect={(id) => setSection("hero", id)}
        renderPreview={(id) => <HeroPreview id={id} />}
      />

      <SectionPicker
        title="Shop By Category Section"
        description="How category tiles are arranged beneath the hero."
        name="category-layout"
        options={CATEGORY_LAYOUTS}
        selectedId={selected.categories}
        onSelect={(id) => setSection("categories", id)}
        renderPreview={(id) => <CategoryPreview id={id} />}
      />

      <SectionPicker
        title="Product Sections"
        description="Applies to every product row -- Wedding Picks, New Arrivals, Best Sellers."
        name="product-layout"
        options={PRODUCT_LAYOUTS}
        selectedId={selected.products}
        onSelect={(id) => setSection("products", id)}
        renderPreview={(id) => <ProductPreview id={id} />}
      />

      <SectionPicker
        title="Bridal Collection Banner"
        description="The dark banner promoting the bridal collection."
        name="bridal-layout"
        options={BRIDAL_LAYOUTS}
        selectedId={selected.bridal}
        onSelect={(id) => setSection("bridal", id)}
        renderPreview={(id) => <BridalPreview id={id} />}
      />

      <SectionPicker
        title="Benefits Strip"
        description="Delivery / COD / quality trust badges."
        name="benefits-layout"
        options={BENEFITS_LAYOUTS}
        selectedId={selected.benefits}
        onSelect={(id) => setSection("benefits", id)}
        renderPreview={(id) => <BenefitsPreview id={id} />}
      />

      <SectionPicker
        title="Customer Reviews"
        description="How testimonial cards are arranged."
        name="reviews-layout"
        options={REVIEWS_LAYOUTS}
        selectedId={selected.reviews}
        onSelect={(id) => setSection("reviews", id)}
        renderPreview={(id) => <ReviewsPreview id={id} />}
      />

      <SectionPicker
        title="Follow Our Style (Instagram)"
        description="How Instagram photo tiles are arranged."
        name="social-gallery-layout"
        options={SOCIAL_GALLERY_LAYOUTS}
        selectedId={selected.socialGallery}
        onSelect={(id) => setSection("socialGallery", id)}
        renderPreview={(id) => <SocialGalleryPreview id={id} />}
      />

      <div className="flex items-center gap-3 border-t border-beige pt-5">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-fit"
          isLoading={isSubmitting}
          disabled={!isDirty}
        >
          {isDirty ? "Save & Apply Layout" : "Layout Saved"}
        </Button>
        {isDirty && (
          <span className="font-body text-xs text-muted">
            Not applied yet -- pick is just a preview until you save.
          </span>
        )}
      </div>
    </form>
  );
}

function SectionPicker<Id extends string>({
  title,
  description,
  name,
  options,
  selectedId,
  onSelect,
  renderPreview,
}: {
  title: string;
  description: string;
  name: string;
  options: LayoutVariantOption<Id>[];
  selectedId: Id;
  onSelect: (id: Id) => void;
  renderPreview: (id: Id) => ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <Heading variant="h3" as="h2">
          {title}
        </Heading>
        <Text variant="bodySm" className="mt-1 text-muted">
          {description}
        </Text>
      </div>
      <div
        role="radiogroup"
        aria-label={title}
        className={cn(
          "grid grid-cols-1 gap-5 sm:grid-cols-2",
          options.length >= 3 && "lg:grid-cols-3",
        )}
      >
        {options.map((layout) => (
          <VariantCard
            key={layout.id}
            layout={layout}
            isSelected={selectedId === layout.id}
            onSelect={() => onSelect(layout.id)}
            name={name}
            preview={renderPreview(layout.id)}
          />
        ))}
      </div>
    </section>
  );
}

function VariantCard<Id extends string>({
  layout,
  isSelected,
  onSelect,
  name,
  preview,
}: {
  layout: LayoutVariantOption<Id>;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  preview: ReactNode;
}) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        isSelected
          ? "border-gold shadow-lg ring-2 ring-gold"
          : "border-beige hover:border-gold/50 hover:shadow-md",
      )}
    >
      <input
        type="radio"
        name={name}
        value={layout.id}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />

      <div className="relative p-3 pb-0">
        {preview}
        <span
          className={cn(
            "absolute right-5 top-5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            isSelected
              ? "border-gold bg-gold text-white"
              : "border-beige bg-white text-transparent",
          )}
          aria-hidden="true"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      </div>

      <div className="flex flex-col gap-0.5 px-4 py-3">
        <span className="font-heading text-[15px] font-semibold text-primary">
          {layout.name}
        </span>
        <span className="font-body text-xs leading-relaxed text-muted">
          {layout.description}
        </span>
      </div>
    </label>
  );
}

/** Small illustrative sketches of each variant's shape -- not live data, just
 * abstract blocks so the admin can tell the layouts apart at a glance. Use
 * theme-aware utility classes (bg-beige/bg-gold/bg-primary) so the preview
 * always matches whatever color theme happens to be active. */
function HeroPreview({ id }: { id: HeroLayoutId }) {
  if (id === "centered") {
    return (
      <div className="flex aspect-[16/11] w-full flex-col items-center justify-center gap-2 rounded-xl bg-secondary p-4">
        <div className="h-2 w-20 rounded-full bg-primary/70" />
        <div className="h-1.5 w-28 rounded-full bg-muted/50" />
        <div className="h-4 w-14 rounded-full bg-gold" />
        <div className="mt-2 h-10 w-full rounded-lg bg-beige" />
      </div>
    );
  }

  if (id === "editorial") {
    return (
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-beige">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          <div className="h-2 w-16 rounded-full bg-white/90" />
          <div className="h-2 w-12 rounded-full bg-white/70" />
          <div className="mt-1 h-3.5 w-10 rounded-full border border-white/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-[16/11] w-full items-center gap-3 rounded-xl bg-secondary p-3">
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-1.5 w-10 rounded-full bg-gold" />
        <div className="h-2 w-16 rounded-full bg-primary/70" />
        <div className="h-1.5 w-14 rounded-full bg-muted/50" />
        <div className="mt-1 h-3.5 w-10 rounded-full bg-gold" />
      </div>
      <div className="aspect-[4/5] h-full rounded-lg bg-beige" />
    </div>
  );
}

function CategoryPreview({ id }: { id: CategoryLayoutId }) {
  if (id === "row") {
    return (
      <div className="flex aspect-[16/8] w-full gap-2 rounded-xl bg-secondary p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-1 flex-col gap-1">
            <div className="aspect-square w-full bg-beige" />
            <div className="h-1 w-full rounded-full bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  if (id === "spotlight") {
    return (
      <div className="flex aspect-[16/8] w-full gap-2 rounded-xl bg-secondary p-3">
        <div className="h-full w-1/2 rounded-lg bg-gold/40" />
        <div className="grid h-full w-1/2 grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-md bg-beige" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid aspect-[16/8] w-full grid-cols-4 gap-2 rounded-xl bg-secondary p-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl bg-beige ring-1 ring-black/5" />
      ))}
    </div>
  );
}

function ProductPreview({ id }: { id: ProductLayoutId }) {
  if (id === "carousel") {
    return (
      <div className="flex aspect-[16/9] w-full gap-2 overflow-hidden rounded-xl bg-secondary p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex shrink-0 flex-col gap-1",
              index === 3 ? "w-6 opacity-40" : "w-1/4",
            )}
          >
            <div className="aspect-square w-full rounded-lg bg-beige" />
            <div className="h-1 w-3/4 rounded-full bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid aspect-[16/9] w-full grid-cols-4 gap-2 rounded-xl bg-secondary p-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="aspect-square w-full rounded-lg bg-beige" />
          <div className="h-1 w-3/4 rounded-full bg-muted/40" />
        </div>
      ))}
    </div>
  );
}

function BridalPreview({ id }: { id: BridalLayoutId }) {
  if (id === "editorial") {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <div className="absolute inset-y-0 left-3 flex flex-col justify-center gap-1.5">
          <div className="h-1.5 w-10 rounded-full bg-gold" />
          <div className="h-2 w-20 rounded-full bg-white/90" />
          <div className="mt-1 h-3.5 w-14 rounded-full bg-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-[16/9] w-full items-center gap-3 rounded-xl bg-primary p-3">
      <div className="aspect-[4/5] h-full rounded-lg bg-white/10" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-1.5 w-10 rounded-full bg-gold" />
        <div className="h-2 w-16 rounded-full bg-white/90" />
        <div className="mt-1 h-3.5 w-14 rounded-full bg-gold" />
      </div>
    </div>
  );
}

function BenefitsPreview({ id }: { id: BenefitsLayoutId }) {
  if (id === "cards") {
    return (
      <div className="grid aspect-[16/7] w-full grid-cols-4 gap-2 rounded-xl bg-secondary p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border border-beige bg-white"
          >
            <div className="h-4 w-4 rounded-full bg-gold/30" />
            <div className="h-1 w-8 rounded-full bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex aspect-[16/7] w-full items-center justify-between gap-2 rounded-xl bg-secondary p-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div className="h-5 w-5 shrink-0 rounded-full bg-gold/30" />
          <div className="h-1 w-8 rounded-full bg-muted/40" />
        </div>
      ))}
    </div>
  );
}

function ReviewsPreview({ id }: { id: ReviewsLayoutId }) {
  if (id === "carousel") {
    return (
      <div className="flex aspect-[16/9] w-full gap-2 overflow-hidden rounded-xl bg-secondary p-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "shrink-0 rounded-lg border border-beige bg-white p-2",
              index === 2 ? "w-6 opacity-40" : "w-1/3",
            )}
          >
            <div className="h-1 w-3/4 rounded-full bg-muted/40" />
            <div className="mt-1 h-1 w-full rounded-full bg-muted/30" />
            <div className="mt-1 h-1 w-1/2 rounded-full bg-muted/30" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid aspect-[16/9] w-full grid-cols-3 gap-2 rounded-xl bg-secondary p-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-beige bg-white p-2">
          <div className="h-1 w-3/4 rounded-full bg-muted/40" />
          <div className="mt-1 h-1 w-full rounded-full bg-muted/30" />
          <div className="mt-1 h-1 w-1/2 rounded-full bg-muted/30" />
        </div>
      ))}
    </div>
  );
}

function SocialGalleryPreview({ id }: { id: SocialGalleryLayoutId }) {
  if (id === "carousel") {
    return (
      <div className="flex aspect-[16/6] w-full gap-2 overflow-hidden rounded-xl bg-secondary p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "aspect-square shrink-0 rounded-lg bg-beige",
              index === 5 && "opacity-40",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid aspect-[16/6] w-full grid-cols-6 gap-2 rounded-xl bg-secondary p-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg bg-beige" />
      ))}
    </div>
  );
}
