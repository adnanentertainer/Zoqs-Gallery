export interface BlessedFridayOffer {
  enabled: boolean;
  discountPercentage: number;
  minSpend: number;
}

export const DEFAULT_BLESSED_FRIDAY_OFFER: BlessedFridayOffer = {
  enabled: false,
  discountPercentage: 10,
  minSpend: 3000,
};
