export interface ProductVariant {
  readonly id: string;
  readonly label: string;
  readonly price: number;
}

export type ProductCategory = 'origen' | 'mezclas' | 'accesorios';

export interface ShopProduct {
  readonly id: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly description: string;
  /** Short line under the name, e.g. origin and process. */
  readonly details?: string;
  readonly notes?: readonly string[];
  readonly badge?: string;
  /** Products without a photo show a branded placeholder. */
  readonly image?: string;
  readonly imagePosition?: string;
  readonly variants: readonly [ProductVariant, ...ProductVariant[]];
}

export const PRODUCT_CATEGORIES: readonly { readonly id: ProductCategory; readonly label: string }[] =
  [
    { id: 'origen', label: 'Cafés de origen' },
    { id: 'mezclas', label: 'Mezclas' },
    { id: 'accesorios', label: 'Accesorios' },
  ];

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  {
    id: 'labralma',
    name: 'LabrAlma · Bourbon Papayo',
    category: 'origen',
    description:
      'Heliconia, Antioquia. Proceso lavado, cultivado a 1740 m s. n. m. Notas de chocolate y cítricos.',
    details: 'Heliconia, Antioquia · Lavado · 1740 m s. n. m.',
    notes: ['Chocolate', 'Cítricos'],
    badge: 'Más vendido',
    image: 'images/productos/labralma-web.jpg',
    imagePosition: '72% center',
    variants: [
      { id: 'labralma-250', label: '250 g', price: 28000 },
      { id: 'labralma-340', label: '340 g', price: 36000 },
    ],
  },
  {
    id: 'mauritania',
    name: 'Mauritania · Honey',
    category: 'origen',
    description:
      'Café de altura con proceso honey: dulzor intenso, cuerpo sedoso y una acidez amable.',
    details: 'Café de altura · Proceso honey',
    notes: ['Panela', 'Frutos rojos', 'Caramelo'],
    badge: 'Nuevo',
    image: 'images/productos/mauritania.png',
    imagePosition: 'center 30%',
    variants: [
      { id: 'mauritania-340', label: '340 g', price: 38000 },
      { id: 'mauritania-500', label: '500 g', price: 52000 },
    ],
  },
  {
    id: 'geisha-huila',
    name: 'Geisha · Huila',
    category: 'origen',
    description: 'Una variedad excepcional, floral y delicada. Ideal para métodos de filtrado.',
    details: 'Pitalito, Huila · Lavado · 1900 m s. n. m.',
    notes: ['Jazmín', 'Bergamota', 'Durazno'],
    badge: 'Edición limitada',
    variants: [{ id: 'geisha-250', label: '250 g', price: 62000 }],
  },
  {
    id: 'pink-bourbon',
    name: 'Pink Bourbon · Nariño',
    category: 'origen',
    description: 'Proceso natural que resalta su fruta: vibrante, jugoso y de final largo.',
    details: 'La Unión, Nariño · Natural · 2000 m s. n. m.',
    notes: ['Frutos rojos', 'Vino', 'Cacao'],
    variants: [
      { id: 'pink-bourbon-250', label: '250 g', price: 45000 },
      { id: 'pink-bourbon-500', label: '500 g', price: 84000 },
    ],
  },
  {
    id: 'mezcla-casa',
    name: 'Raíces de la Casa',
    category: 'mezclas',
    description: 'Nuestra mezcla de todos los días. Tueste medio, balanceada y perfecta con leche.',
    details: 'Mezcla de la casa · Tueste medio',
    notes: ['Cacao', 'Nuez', 'Panela'],
    variants: [
      { id: 'mezcla-casa-250', label: '250 g', price: 22000 },
      { id: 'mezcla-casa-500', label: '500 g', price: 40000 },
      { id: 'mezcla-casa-1000', label: '1 kg', price: 74000 },
    ],
  },
  {
    id: 'descafeinado',
    name: 'Descafeinado · Tolima',
    category: 'mezclas',
    description: 'Descafeinado con caña de azúcar, sin químicos. Todo el sabor, a cualquier hora.',
    details: 'Planadas, Tolima · Descafeinado natural (EA)',
    notes: ['Panela', 'Manzana', 'Chocolate'],
    variants: [{ id: 'descafeinado-250', label: '250 g', price: 30000 }],
  },
  {
    id: 'taza-ceramica',
    name: 'Taza de cerámica Nuestras Raíces',
    category: 'accesorios',
    description: 'Taza artesanal de 300 ml con nuestro logo. Apta para lavavajillas.',
    variants: [{ id: 'taza-300', label: '300 ml', price: 32000 }],
  },
  {
    id: 'filtros-v60',
    name: 'Filtros de papel V60',
    category: 'accesorios',
    description: 'Filtros cónicos de papel para métodos de goteo. Tamaño 02.',
    variants: [{ id: 'filtros-100', label: '100 unidades', price: 18000 }],
  },
];

export function findVariant(
  variantId: string,
): { product: ShopProduct; variant: ProductVariant } | undefined {
  for (const product of SHOP_PRODUCTS) {
    const variant = product.variants.find((option) => option.id === variantId);
    if (variant) {
      return { product, variant };
    }
  }
  return undefined;
}
