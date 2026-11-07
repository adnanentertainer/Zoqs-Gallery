"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthMessage } from "@/components/auth";
import { Heading, Text } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LAYOUTS,
  HERO_LAYOUTS,
  type CategoryLayoutId,
  type HeroLayoutId,
  type LayoutTemplate,
  type LayoutVariantOption,
} from "@/types/layoutTemplate";
import { updateAdminLayoutTemplateAction } from "@/app/admin/layout-template/actions";

interface LayoutTemplateFormProps {
  initialTemplate: LayoutTemplate;
}

export function LayoutTemplateForm({
  initialTemplate,
}: LayoutTemplateFormProps) {
  const [selected, setSelected] = useState(initialTemplate);
  const [saved, setSaved] = useState(initialTemplate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty =
    selected.hero !== saved.hero || selected.categories !== saved.categories;

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

      <section className="flex flex-col gap-4">
        <div>
          <Heading variant="h3" as="h2">
            Hero Section
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            The first thing visitors see at the top of the homepage.
          </Text>
        </div>
        <div
          role="radiogroup"
          aria-label="Hero section layout"
          className="grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {HERO_LAYOUTS.map((layout) => (
            <VariantCard
              key={layout.id}
              layout={layout}
              isSelected={selected.hero === layout.id}
              onSelect={() => {
                setSelected((prev) => ({ ...prev, hero: layout.id }));
                setSuccess(false);
              }}
              name="hero-layout"
              preview={<HeroPreview id={layout.id} />}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <Heading variant="h3" as="h2">
            Shop By Category Section
          </Heading>
          <Text variant="bodySm" className="mt-1 text-muted">
            How category tiles are arranged beneath the hero.
          </Text>
        </div>
        <div
          role="radiogroup"
          aria-label="Category section layout"
          className="grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {CATEGORY_LAYOUTS.map((layout) => (
            <VariantCard
              key={layout.id}
              layout={layout}
              isSelected={selected.categories === layout.id}
              onSelect={() => {
                setSelected((prev) => ({ ...prev, categories: layout.id }));
                setSuccess(false);
              }}
              name="category-layout"
              preview={<CategoryPreview id={layout.id} />}
            />
          ))}
        </div>
      </section>

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
        <div
          key={index}
          className="rounded-xl bg-beige ring-1 ring-black/5"
        />
      ))}
    </div>
  );
}
