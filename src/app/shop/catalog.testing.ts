import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ApiCoffeeInfo,
  ApiPrice,
  ApiProduct,
  ApiProductList,
  CATALOG_API_URL,
  CatalogService,
} from './catalog';

export const TEST_CATALOG_URL = 'http://test/productos';

const cafe = { id: 1, slug: 'cafe', nombre: 'Café' };

function price(sku: string, precio: number, opciones: ApiPrice['opciones'], stock = 10): ApiPrice {
  return { id: 0, sku, imagen_url: null, opciones, precio, stock, disponible: stock > 0 };
}

function coffee(
  id: number,
  nombre: string,
  precios: ApiPrice[],
  extra: Partial<ApiCoffeeInfo> = {},
): ApiCoffeeInfo {
  return {
    id,
    nombre,
    imagen_url: null,
    proceso: null,
    variedad: null,
    tostion: null,
    notas: null,
    ubicacion: null,
    precios,
    ...extra,
  };
}

function product(id: number, nombre: string, extra: Partial<ApiProduct>): ApiProduct {
  return {
    id,
    nombre,
    descripcion: '',
    imagen_url: null,
    categoria: cafe,
    activo: true,
    disponible: true,
    informacion_cafe: [],
    precios: [],
    ...extra,
  };
}

export const TEST_CATALOG: ApiProductList = {
  total: 5,
  items: [
    product(1, 'LabrAlma', {
      imagen_url: 'images/productos/labralma-web.jpg',
      informacion_cafe: [
        coffee(
          1,
          'LabrAlma',
          [
            price('labralma-250', 28000, { gramaje_g: 250, presentacion: 'grano' }),
            price('labralma-340', 36000, { gramaje_g: 340, presentacion: 'grano' }),
          ],
          {
            proceso: 'LAVADO',
            notas: 'Chocolate, Cítricos, Panela y Frutos rojos',
            ubicacion: {
              id: 1,
              origen: 'Heliconia - Antioquia',
              municipio: 'Heliconia',
              departamento: 'Antioquia',
              altura_msnm: 1740,
            },
          },
        ),
      ],
    }),
    product(2, 'Mauritania', {
      informacion_cafe: [
        coffee(2, 'Lavado', [
          price('mauritania-lavado', 38000, { gramaje_g: 340, presentacion: 'grano' }),
        ]),
        coffee(3, 'Honey', [
          price('mauritania-honey', 38000, { gramaje_g: 340, presentacion: 'molido' }),
        ]),
      ],
    }),
    product(3, 'Geisha', {
      informacion_cafe: [coffee(4, 'Geisha', [price('geisha-250', 62000, { gramaje_g: 250 })])],
    }),
    product(4, 'Espresso Intenso', {
      disponible: false,
      informacion_cafe: [
        coffee(5, 'Espresso Intenso', [price('espresso-500', 32000, { gramaje_g: 500 }, 0)]),
      ],
    }),
    product(5, 'Taza de cerámica', {
      categoria: { id: 2, slug: 'accesorios', nombre: 'Accesorios' },
      precios: [price('taza-300', 32000, { capacidad: '300 ml' })],
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
