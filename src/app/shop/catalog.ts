export interface CoffeeVariant {
  readonly id: string;
  readonly weight: number;
  readonly price: number;
}

export interface ShopProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly image: string;
  readonly variants: readonly [CoffeeVariant, ...CoffeeVariant[]];
}

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  {
    id: 'labralma',
    name: 'LabrAlma · Bourbon Papayo',
    description:
      'Heliconia, Antioquia. Proceso lavado, cultivado a 1740 m s. n. m. Notas de chocolate y cítricos.',
    image: 'images/cafe/labralma.JPG',
    variants: [
      { id: 'labralma-250', weight: 250, price: 28000 },
      { id: 'labralma-340', weight: 340, price: 36000 },
    ],
  },
];
