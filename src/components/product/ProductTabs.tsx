"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Text } from "@/components/ui/Typography";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { CareInstructions } from "@/components/product/CareInstructions";
import { DeliveryInfo } from "@/components/product/DeliveryInfo";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const TABS = [
  { id: "description", label: "Description" },
  { id: "details", label: "Details" },
  { id: "care", label: "Care Instructions" },
  { id: "delivery", label: "Delivery & Returns" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  const panels: Record<TabId, ReactNode> = {
    description: (
      <Text variant="body" className="text-muted">
        {product.description}
      </Text>
    ),
    details: <ProductSpecifications product={product} />,
    care: <CareInstructions product={product} />,
    delivery: <DeliveryInfo />,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <div
          role="tablist"
          aria-label="Product information"
          className="flex gap-8 border-b border-beige"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "-mb-px border-b-2 pb-3 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                activeTab === tab.id
                  ? "border-gold text-primary"
                  : "border-transparent text-muted hover:text-primary",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {TABS.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {panels[tab.id]}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:hidden">
        {TABS.map((tab) => (
          <details
            key={tab.id}
            className="group border-b border-beige py-4 first:pt-0"
            open={tab.id === "description"}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-body text-sm font-semibold text-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              {tab.label}
              <ChevronDown
                className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-3">{panels[tab.id]}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
