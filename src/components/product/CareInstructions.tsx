import { Sparkles } from "lucide-react";
import type { Product } from "@/types";

const DEFAULT_CARE_INSTRUCTIONS = [
  "Avoid direct contact with perfume, lotion and other sprays.",
  "Keep away from water, including while bathing or swimming.",
  "Store in a dry place, away from direct sunlight.",
  "Clean gently with a soft, dry cloth after each wear.",
  "Store separately in a pouch or box to prevent scratches.",
];

interface CareInstructionsProps {
  product: Product;
}

export function CareInstructions({ product }: CareInstructionsProps) {
  const instructions = product.careInstructions ?? DEFAULT_CARE_INSTRUCTIONS;

  return (
    <ul className="flex flex-col gap-3">
      {instructions.map((instruction) => (
        <li
          key={instruction}
          className="flex items-start gap-3 font-body text-sm text-primary"
        >
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
            aria-hidden="true"
          />
          {instruction}
        </li>
      ))}
    </ul>
  );
}
