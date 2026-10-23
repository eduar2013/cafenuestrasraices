import { TestBed } from '@angular/core/testing';
import { CoffeeOriginsComponent } from './coffee-origins';

describe('CoffeeOriginsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoffeeOriginsComponent],
    }).compileComponents();
  });

  it('should identify the sample catalog and show the first coffee by default', async () => {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.demo-notice')?.textContent).toContain('identificados como ejemplos');
    expect(element.querySelector('h3')?.textContent).toBe('LabrAlma');
    expect(element.querySelectorAll('.map-point')).toHaveLength(5);
    expect(element.querySelectorAll('.map-point[aria-pressed="true"]')).toHaveLength(1);
    expect(element.querySelector('#origin-detail')?.getAttribute('aria-live')).toBe('polite');
    expect(element.querySelector('.origin-map img')?.getAttribute('alt')).toContain(
      'división por departamentos',
    );
    expect(element.querySelector('.map-caption')?.textContent).toContain(
      'División departamental continental',
    );
  });

  it('should update the complete coffee detail for every map point', async () => {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll<HTMLButtonElement>('.map-point');

    for (const [index, origin] of fixture.componentInstance.origins.entries()) {
      buttons[index].click();
      await fixture.whenStable();
      const detail = element.querySelector('#origin-detail')!;

      expect(detail.querySelector('h3')?.textContent).toBe(origin.coffees[0].name);
      expect(detail.querySelector('.coffee-location')?.textContent).toBe(origin.location);
      const coffee = origin.coffees[0];
      const fields = Array.from(detail.querySelectorAll('dd')).map(
        (field) => field.textContent?.replace(/\s+/g, ' ').trim(),
      );
      expect(fields).toEqual([
        coffee.variety, coffee.process, coffee.roast,
        ...(coffee.altitude ? [`${coffee.altitude} m s. n. m.`] : []),
        (coffee.presentations ?? [250]).map((weight) => `${weight} g`).join(' y '),
      ]);
      expect(detail.querySelector('.eyebrow')?.textContent?.includes('Ejemplo')).toBe(
        coffee.isExample === true,
      );
      expect(Array.from(detail.querySelectorAll('.tasting-notes li')).map((note) => note.textContent))
        .toEqual(origin.coffees[0].notes);
      expect(buttons[index].getAttribute('aria-pressed')).toBe('true');
      expect(element.querySelectorAll('.map-point[aria-pressed="true"]')).toHaveLength(1);
    }
  });

  it('should support the alternative origin list and several coffees per origin', async () => {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelectorAll<HTMLButtonElement>('.origin-list button')[1].click();
    await fixture.whenStable();
    element.querySelectorAll<HTMLButtonElement>('.coffee-options button')[1].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Dulce montaña');
    expect(element.querySelectorAll('dd')[1].textContent).toBe('Honey');

    const origins = element.querySelectorAll<HTMLButtonElement>('.origin-list button');
    origins[2].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Esencia del Huila');
    expect(element.querySelector('.coffee-options')).toBeNull();
    expect(origins[2].getAttribute('aria-pressed')).toBe('true');
    origins[1].click();
    await fixture.whenStable();
    expect(element.querySelector('h3')?.textContent).toBe('Raíces de Antioquia');
  });

  it('should show the supplied LabrAlma details without labeling it as an example', async () => {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const detail = element.querySelector('#origin-detail')!;

    expect(detail.querySelector('h3')?.textContent).toBe('LabrAlma');
    expect(detail.querySelector('.coffee-location')?.textContent).toBe('Heliconia, Antioquia');
    expect(detail.textContent).toContain('Bourbon Papayo');
    expect(detail.textContent).toContain('1740 m s. n. m.');
    expect(detail.textContent?.replace(/\s+/g, ' ')).toContain('250 g y 340 g');
    expect(detail.textContent).toContain('Por confirmar');
    expect(detail.querySelector('.eyebrow')?.textContent).not.toContain('Ejemplo');
  });

  it('should switch product images and restore the illustration for coffees without a photo', async () => {
    const fixture = TestBed.createComponent(CoffeeOriginsComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector<HTMLImageElement>('.coffee-photo img')!;
    const coffee = component.selectedCoffee();

    expect(image.getAttribute('src')).toBe('images/carousel/slide-1.jpg');
    expect(element.querySelector('.coffee-photo span')?.textContent).toBe('Imagen ilustrativa');

    component.selectedCoffee.set({
      ...coffee,
      image: 'images/cafe/labralma.jpg',
      imageAlt: 'Café LabrAlma Bourbon Papayo de Heliconia',
    });
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('images/cafe/labralma.jpg');
    expect(image.getAttribute('alt')).toBe('Café LabrAlma Bourbon Papayo de Heliconia');
    expect(element.querySelector('.coffee-photo span')).toBeNull();

    component.selectedCoffee.set({ ...coffee, image: 'images/cafe/otro-cafe.jpg' });
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('images/cafe/otro-cafe.jpg');
    expect(image.getAttribute('alt')).toBe(coffee.name);

    component.selectOrigin(component.origins[1]);
    await fixture.whenStable();
    expect(image.getAttribute('src')).toBe('images/carousel/slide-1.jpg');
    expect(image.getAttribute('alt')).toContain('Fotografía ilustrativa');
    expect(element.querySelector('.coffee-photo span')).not.toBeNull();
  });

  it('should project each origin to the same coordinate system as the SVG', () => {
    const component = TestBed.createComponent(CoffeeOriginsComponent).componentInstance;

    for (const origin of component.origins) {
      expect(component.mapLeft(origin)).toBeCloseTo(((origin.longitude + 80) * 26 + 20) / 4);
      expect(component.mapTop(origin)).toBeCloseTo(((13.5 - origin.latitude) * 26 + 20) / 5.2);
      expect(component.mapLeft(origin)).toBeGreaterThan(0);
      expect(component.mapLeft(origin)).toBeLessThan(100);
      expect(component.mapTop(origin)).toBeGreaterThan(0);
      expect(component.mapTop(origin)).toBeLessThan(100);
    }
  });
});
