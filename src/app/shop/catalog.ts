import { httpResource } from '@angular/common/http';
import { Injectable, InjectionToken, computed, inject } from '@angular/core';

export const CATALOG_API_URL = new InjectionToken<string>('CATALOG_API_URL', {
  providedIn: 'root',
  factory: () => 'http://127.0.0.1:8000/products',
});

export interface ProductVariant {
  readonly id: string;
  readonly label: string;
  readonly price: number;
  readonly available: boolean;
}

export interface ProductCategory {
  readonly id: string;
  readonly label: string;
}

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
  readonly available: boolean;
  readonly variants: readonly [ProductVariant, ...ProductVariant[]];
}

// Shape of GET /products.

export interface ApiNamed {
  readonly id: number;
  readonly name: string;
}

export interface ApiVariant {
  readonly id: number;
  readonly sku: string;
  readonly variant_name: string;
  readonly weight: number | null;
  readonly grind_type: string | null;
  readonly price: number;
  readonly stock: number;
  readonly is_default: boolean;
  readonly is_available: boolean;
}

export interface ApiOrigin {
  readonly id: number;
  readonly region: string | null;
  readonly municipality: string | null;
  readonly department: string | null;
  readonly altitude_masl: number | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
}

export interface ApiCoffeeDetail {
  readonly process: ApiNamed | null;
  readonly variety: ApiNamed | null;
  readonly roast_level: ApiNamed | null;
  readonly origin: ApiOrigin | null;
  readonly tasting_notes: string | null;
}

export interface ApiImage {
  readonly id: number;
  readonly image_url: string;
  readonly is_primary: boolean;
}

export interface ApiProduct {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly is_available: boolean;
  readonly category: { readonly id: number; readonly slug: string; readonly name: string };
  readonly brand: ApiNamed | null;
  readonly coffee_detail: ApiCoffeeDetail | null;
  readonly variants: readonly ApiVariant[];
  readonly images: readonly ApiImage[];
}

export interface ApiProductList {
  readonly total: number;
  readonly items: readonly ApiProduct[];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly url = inject(CATALOG_API_URL);
  private readonly resource = httpResource<readonly ShopProduct[]>(() => this.url, {
    parse: (response) => toShopProducts(response as ApiProductList),
    defaultValue: [],
  });

  readonly products = computed(() => (this.resource.hasValue() ? this.resource.value() : []));
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;
  readonly categories = computed(() => {
    const categories = new Map<string, ProductCategory>();
    for (const product of this.products()) {
      categories.set(product.category.id, product.category);
    }
    return Array.from(categories.values());
  });

  reload(): void {
    this.resource.reload();
  }

  findVariant(variantId: string): { product: ShopProduct; variant: ProductVariant } | undefined {
    for (const product of this.products()) {
      const variant = product.variants.find((option) => option.id === variantId);
      if (variant) {
        return { product, variant };
      }
    }
    return undefined;
  }
}

/** Each active product with at least one variant becomes a card. */
export function toShopProducts(response: ApiProductList): readonly ShopProduct[] {
  return response.items
    .filter((product) => product.is_active)
    .flatMap((product) => {
      const card = toCard(product);
      return card ? [card] : [];
    });
}

function toCard(product: ApiProduct): ShopProduct | undefined {
  // The default presentation goes first so it is the one preselected on the card.
  const sorted = [...product.variants].sort((a, b) => Number(b.is_default) - Number(a.is_default));
  const variants = sorted.map((variant): ProductVariant => ({
    id: variant.sku,
    label: variant.variant_name || variant.sku,
    price: variant.price,
    available: variant.is_available && variant.stock > 0,
  }));
  if (variants.length === 0) {
    return undefined;
  }
  const available = product.is_available && variants.some((variant) => variant.available);
  const detail = product.coffee_detail;
  const image = product.images.find((item) => item.is_primary) ?? product.images[0];
  const notes = splitNotes(detail?.tasting_notes ?? null);
  return {
    id: `${product.id}`,
    name: product.name,
    category: { id: product.category.slug, label: product.category.name },
    description: product.description ?? '',
    details: (detail && coffeeDetails(detail)) || undefined,
    notes: notes.length ? notes : undefined,
    badge: available ? undefined : 'Agotado',
    image: image?.image_url,
    available,
    variants: variants as [ProductVariant, ...ProductVariant[]],
  };
}

function coffeeDetails(detail: ApiCoffeeDetail): string {
  const origin = detail.origin;
  const place =
    origin?.region ||
    [origin?.municipality, origin?.department].filter(Boolean).join(' - ') ||
    undefined;
  const altitude = origin?.altitude_masl;
  return [
    place,
    detail.process?.name,
    detail.variety?.name,
    detail.roast_level && `Tostión ${detail.roast_level.name}`,
    altitude && `${altitude} m s. n. m.`,
  ]
    .filter(Boolean)
    .join(' · ');
}

function splitNotes(notes: string | null): readonly string[] {
  return (notes ?? '')
    .replace(/\.\s*$/, '')
    .split(/,|\s+y\s+/)
    .map((note) => note.trim())
    .filter(Boolean);
}
