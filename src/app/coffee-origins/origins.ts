import { ApiOrigin, ApiProduct, productImages, splitNotes, variantWeight } from '../shop/catalog';

export interface OriginCoffee {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
  readonly description: string;
  readonly variety?: string;
  readonly process?: string;
  readonly roast?: string;
  readonly altitude?: number;
  readonly notes: readonly string[];
  /** Distinct weights (g) of its presentations, smallest first. */
  readonly weights: readonly number[];
  readonly available: boolean;
}

export interface CoffeeOrigin {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly latitude: number;
  readonly longitude: number;
  /** True when the API had no coordinates and the department centre is used. */
  readonly approximate: boolean;
  readonly coffees: readonly [OriginCoffee, ...OriginCoffee[]];
}

/** Approximate centre of each department, used while an origin has no coordinates. */
const DEPARTMENT_CENTRES: Readonly<Record<string, readonly [number, number]>> = {
  antioquia: [6.7, -75.5],
  boyaca: [5.8, -73.1],
  caldas: [5.3, -75.3],
  caqueta: [1.0, -74.5],
  casanare: [5.3, -71.6],
  cauca: [2.4, -76.8],
  cesar: [9.3, -73.5],
  cundinamarca: [4.9, -74.1],
  huila: [2.5, -75.6],
  'la guajira': [11.4, -72.6],
  magdalena: [10.4, -74.2],
  meta: [3.5, -73.0],
  narino: [1.3, -77.6],
  'norte de santander': [7.9, -72.8],
  putumayo: [0.8, -76.6],
  quindio: [4.5, -75.7],
  risaralda: [5.0, -75.9],
  santander: [6.6, -73.3],
  'sierra nevada': [10.9, -73.8],
  tolima: [4.0, -75.2],
  'valle del cauca': [3.9, -76.5],
};

/** Groups the coffees of the catalog by origin; origins that cannot be placed are left out. */
export function toCoffeeOrigins(products: readonly ApiProduct[]): readonly CoffeeOrigin[] {
  const origins = new Map<number, { origin: ApiOrigin; coffees: OriginCoffee[] }>();
  for (const product of products) {
    const origin = product.coffee_detail?.origin;
    if (!origin) {
      continue;
    }
    const group = origins.get(origin.id) ?? { origin, coffees: [] };
    group.coffees.push(toOriginCoffee(product, origin));
    origins.set(origin.id, group);
  }
  return Array.from(origins.values()).flatMap(({ origin, coffees }) => {
    const position = originPosition(origin);
    if (!position) {
      return [];
    }
    const name =
      [origin.municipality, origin.department].filter(Boolean).join(', ') ||
      origin.region ||
      'Origen';
    return [
      {
        id: `${origin.id}`,
        name,
        location: origin.region || name,
        ...position,
        coffees: coffees as [OriginCoffee, ...OriginCoffee[]],
      },
    ];
  });
}

function toOriginCoffee(product: ApiProduct, origin: ApiOrigin): OriginCoffee {
  const detail = product.coffee_detail;
  const weights = product.variants.flatMap((variant) => variantWeight(variant) ?? []);
  return {
    id: `${product.id}`,
    name: product.name,
    image: productImages(product)[0],
    description: product.description ?? '',
    variety: detail?.variety?.name,
    process: detail?.process?.name,
    roast: detail?.roast_level?.name,
    altitude: origin.altitude_masl ?? undefined,
    notes: splitNotes(detail?.tasting_notes ?? null),
    weights: [...new Set(weights)].sort((a, b) => a - b),
    available:
      product.is_available &&
      product.variants.some((variant) => variant.is_available && variant.stock > 0),
  };
}

function originPosition(
  origin: ApiOrigin,
): { latitude: number; longitude: number; approximate: boolean } | undefined {
  if (origin.latitude !== null && origin.longitude !== null) {
    return { latitude: origin.latitude, longitude: origin.longitude, approximate: false };
  }
  // Look for a known department in the department field first, then in the region text.
  for (const text of [origin.department, origin.region]) {
    const key = normalize(text ?? '');
    const match = Object.keys(DEPARTMENT_CENTRES)
      .filter((department) => key.includes(department))
      // "norte de santander" must win over "santander".
      .sort((a, b) => b.length - a.length)[0];
    if (match) {
      const [latitude, longitude] = DEPARTMENT_CENTRES[match];
      return { latitude, longitude, approximate: true };
    }
  }
  return undefined;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
