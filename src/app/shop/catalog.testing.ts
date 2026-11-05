import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ApiCoffeeDetail,
  ApiProduct,
  ApiProductList,
  ApiVariant,
  CATALOG_API_URL,
  CatalogService,
} from './catalog';

export const TEST_CATALOG_URL = 'http://test/products';

const coffeeCategory = { id: 1, slug: 'coffee', name: 'Café' };

function variant(sku: string, variant_name: string, price: number, stock = 10): ApiVariant {
  return {
    id: 0,
    sku,
    variant_name,
    weight: null,
    grind_type: null,
    price,
    stock,
    is_default: false,
    is_available: stock > 0,
  };
}

function coffee(extra: Partial<ApiCoffeeDetail> = {}): ApiCoffeeDetail {
  return {
    process: null,
    variety: null,
    roast_level: null,
    origin: null,
    tasting_notes: null,
    ...extra,
  };
}

function product(id: number, name: string, extra: Partial<ApiProduct>): ApiProduct {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: '',
    is_active: true,
    is_available: true,
    category: coffeeCategory,
    brand: null,
    coffee_detail: coffee(),
    variants: [],
    images: [],
    ...extra,
  };
}

export const TEST_CATALOG: ApiProductList = {
  total: 6,
  items: [
    product(1, 'LabrAlma', {
      images: [{ id: 1, image_url: 'images/productos/labralma-web.jpg', is_primary: true }],
      coffee_detail: coffee({
        process: { id: 1, name: 'Lavado' },
        tasting_notes: 'Chocolate, Cítricos, Panela y Frutos rojos',
        origin: {
          id: 1,
          region: null,
          municipality: 'Heliconia',
          department: 'Antioquia',
          altitude_masl: 1740,
          latitude: null,
          longitude: null,
        },
      }),
      variants: [
        variant('labralma-250', '250 g grano', 28000),
        variant('labralma-340', '340 g grano', 36000),
      ],
    }),
    product(2, 'Mauritania Lavado', {
      variants: [variant('mauritania-lavado', '340 g grano', 38000)],
    }),
    product(3, 'Mauritania Honey', {
      variants: [variant('mauritania-honey', '340 g molido', 38000)],
    }),
    product(4, 'Geisha', {
      variants: [variant('geisha-250', '250 g grano', 62000)],
    }),
    product(5, 'Espresso Intenso', {
      is_available: false,
      variants: [variant('espresso-500', '500 g molido', 32000, 0)],
    }),
    product(6, 'Taza de cerámica', {
      category: { id: 2, slug: 'accesorios', name: 'Accesorios' },
      coffee_detail: null,
      variants: [variant('taza-300', '300 ml', 32000)],
    }),
  ],
};

export function provideCatalogTesting() {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    { provide: CATALOG_API_URL, useValue: TEST_CATALOG_URL },
  ];
}

/** Answers the pending catalog request with {@link TEST_CATALOG}. */
export async function flushCatalog(): Promise<CatalogService> {
  const catalog = TestBed.inject(CatalogService);
  TestBed.tick();
  TestBed.inject(HttpTestingController).expectOne(TEST_CATALOG_URL).flush(TEST_CATALOG);
  await TestBed.inject(ApplicationRef).whenStable();
  return catalog;
}
