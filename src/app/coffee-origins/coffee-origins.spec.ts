import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CatalogService } from '../shop/catalog';
import { TEST_CATALOG, flushCatalog, provideCatalogTesting } from '../shop/catalog.testing';
import { CoffeeOriginsComponent } from './coffee-origins';
import { toCoffeeOrigins } from './origins';

describe('CoffeeOriginsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoffeeOriginsComponent],
      providers: [provideRouter([]), provideCatalogTesting()],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    await flushCatalog();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should group the catalog coffees by origin', () => {
    const origins = toCoffeeOrigins(TEST_CATALOG.items);

    expect(origins.map((origin) => origin.name)).toEqual([
      'Heliconia, Antioquia',
      'Jericó, Antioquia',
      'Colombia - Tolima',
    ]);
    expect(origins[1].coffees.map((coffee) => coffee.name)).toEqual([
      'Mauritania Lavado',
      'Mauritania Honey',
    ]);
    expect(origins[1]).toMatchObject({
      location: 'Finca Mauritania',
      latitude: 5.79,
      longitude: -75.79,
      approximate: false,
    });
    expect(origins[0].coffees[0].weights).toEqual([250, 340, 500]);
  });

  it('should place origins without coordinates at their department centre', () => {
    const [heliconia, , tolima] = toCoffeeOrigins(TEST_CATALOG.items);

    expect(heliconia).toMatchObject({ latitude: 6.7, longitude: -75.5, approximate: true });
    // The department is only mentioned in the region text.
    expect(tolima).toMatchObject({ latitude: 4.0, longitude: -75.2, approximate: true });
  });

  it('should leave out origins that cannot be placed on the map', () => {
    const [product] = TEST_CATALOG.items;
    const nowhere = {
      ...product,
      coffee_detail: {
        ...product.coffee_detail!,
        origin: { ...product.coffee_detail!.origin!, department: 'Desconocido', region: null },
      },
    };

    expect(toCoffeeOrigins([nowhere])).toEqual([]);
  });

  it('should show one map point per origin and the first coffee by default', async () => {
    const { element } = await render();

    expect(element.querySelectorAll('.map-point')).toHaveLength(3);
    expect(element.querySelectorAll('.map-point[aria-pressed="true"]')).toHaveLength(1);
    expect(element.querySelector('h3')?.textContent).toBe('LabrAlma');
    expect(element.querySelector('.coffee-location')?.textContent).toContain(
      'ubicación aproximada',
    );
    expect(element.querySelector('.coffee-photo img')?.getAttribute('src')).toBe(
      'images/productos/labralma-web.jpg',
    );
    expect(element.textContent).toContain('1740 m s. n. m.');
    expect(element.querySelector('.shop-link')?.getAttribute('href')).toBe('/tienda');
    expect(element.querySelector('#origin-detail')?.getAttribute('aria-live')).toBe('polite');
  });

  it('should switch origins and the coffees of an origin', async () => {
    const { fixture, element } = await render();

    element.querySelectorAll<HTMLButtonElement>('.origin-list button')[1].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Mauritania Lavado');
    expect(element.querySelector('.coffee-location')?.textContent?.trim()).toBe('Finca Mauritania');
    expect(Array.from(element.querySelectorAll('dd')).map((field) => field.textContent)).toEqual([
      'Castillo',
      'Lavado',
      'Media',
      '1950 m s. n. m.',
      expect.stringContaining('340 g'),
    ]);

    element.querySelectorAll<HTMLButtonElement>('.coffee-options button')[1].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Mauritania Honey');
    expect(element.querySelector('.tasting-notes')).toBeNull();

    element.querySelectorAll<HTMLButtonElement>('.map-point')[2].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Geisha');
    expect(element.querySelector('.coffee-options')).toBeNull();
    // Coffees without a photo simply show no thumbnail.
    expect(element.querySelector('.coffee-photo')).toBeNull();
  });

  it('should show a message and a retry button when the API fails', async () => {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne(() => true)
      .flush('error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar los orígenes',
    );
    expect(element.querySelectorAll('.map-point')).toHaveLength(0);
    expect(TestBed.inject(CatalogService).products()).toEqual([]);
  });

  it('should project each origin to the same coordinate system as the SVG', async () => {
    const { fixture } = await render();
    const component = fixture.componentInstance;

    for (const origin of component.origins()) {
      expect(component.mapLeft(origin)).toBeCloseTo(((origin.longitude + 80) * 26 + 20) / 4);
      expect(component.mapTop(origin)).toBeCloseTo(((13.5 - origin.latitude) * 26 + 20) / 5.2);
      expect(component.mapLeft(origin)).toBeGreaterThan(0);
      expect(component.mapLeft(origin)).toBeLessThan(100);
      expect(component.mapTop(origin)).toBeGreaterThan(0);
      expect(component.mapTop(origin)).toBeLessThan(100);
    }
  });
});
