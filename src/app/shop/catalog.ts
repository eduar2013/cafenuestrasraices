import { httpResource } from '@angular/common/http';
import { Injectable, InjectionToken, computed, inject } from '@angular/core';

export const CATALOG_API_URL = new InjectionToken<string>('CATALOG_API_URL', {
  providedIn: 'root',
  factory: () => 'http://127.0.0.1:8000/productos',
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

// Shape of GET /productos.

export interface ApiPrice {
  readonly id: number;
  readonly sku: string;
  readonly imagen_url: string | null;
  readonly opciones: Readonly<Record<string, string | number | null>> | null;
  readonly precio: number;
  readonly stock: number;
  readonly disponible: boolean;
}

export interface ApiLocation {
  readonly id: number;
  readonly origen: string | null;
  readonly municipio: string | null;
  readonly departamento: string | null;
  readonly altura_msnm: number | null;
}

export interface ApiCoffeeInfo {
  readonly id: number;
  readonly nombre: string;
  readonly imagen_url: string | null;
  readonly proceso: string | null;
  readonly variedad: string | null;
  readonly tostion: string | null;
  readonly notas: string | null;
  readonly ubicacion: ApiLocation | null;
  readonly precios: readonly ApiPrice[];
}

export interface ApiProduct {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly imagen_url: string | null;
  readonly categoria: { readonly id: number; readonly slug: string; readonly nombre: string };
  readonly activo: boolean;
  readonly disponible: boolean;
  readonly informacion_cafe: readonly ApiCoffeeInfo[];
  readonly precios: readonly ApiPrice[];
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

/**
 * Each coffee profile (`informacion_cafe`) becomes its own card, so a product like
 * "Mauritania" with a washed and a honey process shows both. Products without coffee
 * information (e.g. accessories) use their own `precios`.
 */
export function toShopProducts(response: ApiProductList): readonly ShopProduct[] {
  return response.items
    .filter((product) => product.activo)
    .flatMap((product) => {
      if (product.informacion_cafe.length === 0) {
        const card = toCard(product, `${product.id}`, product.nombre, product.precios, {
          image: product.imagen_url,
        });
        return card ? [card] : [];
      }
      return product.informacion_cafe.flatMap((info) => {
        const name =
          info.nombre && info.nombre !== product.nombre
            ? `${product.nombre} · ${info.nombre}`
            : product.nombre;
        const card = toCard(product, `${product.id}-${info.id}`, name, info.precios, {
          image: info.imagen_url ?? product.imagen_url,
          details: coffeeDetails(info),
          notes: splitNotes(info.notas),
        });
        return card ? [card] : [];
      });
    });
}

function toCard(
  product: ApiProduct,
  id: string,
  name: string,
  prices: readonly ApiPrice[],
  extra: { image: string | null; details?: string; notes?: readonly string[] },
): ShopProduct | undefined {
  const variants = prices.map((price): ProductVariant => ({
    id: price.sku,
    label: variantLabel(price),
    price: price.precio,
    available: price.disponible && price.stock > 0,
  }));
  if (variants.length === 0) {
    return undefined;
  }
  const available = product.disponible && variants.some((variant) => variant.available);
  return {
    id,
    name,
    category: { id: product.categoria.slug, label: product.categoria.nombre },
    description: product.descripcion ?? '',
    details: extra.details || undefined,
    notes: extra.notes?.length ? extra.notes : undefined,
    badge: available ? undefined : 'Agotado',
    image: extra.image ?? undefined,
    available,
    variants: variants as [ProductVariant, ...ProductVariant[]],
  };
}

function coffeeDetails(info: ApiCoffeeInfo): string {
  const altitude = info.ubicacion?.altura_msnm;
  return [
    info.ubicacion?.origen,
    info.proceso && capitalize(info.proceso.toLowerCase()),
    info.variedad,
    info.tostion && `Tostión ${info.tostion}`,
    altitude && `${altitude} m s. n. m.`,
  ]
    .filter(Boolean)
    .join(' · ');
}

function splitNotes(notes: string | null): readonly string[] {
  return (notes ?? '')
    .split(/,|\s+y\s+/)
    .map((note) => note.trim())
    .filter(Boolean);
}

function variantLabel(price: ApiPrice): string {
  const { gramaje_g, presentacion, ...rest } = price.opciones ?? {};
  const parts = [
    gramaje_g != null ? `${gramaje_g} g` : undefined,
    typeof presentacion === 'string' ? capitalize(presentacion) : undefined,
    ...Object.values(rest).map((value) => (value == null ? undefined : `${value}`)),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : price.sku;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
