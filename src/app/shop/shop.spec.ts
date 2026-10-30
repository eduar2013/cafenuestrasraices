import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShopComponent } from './shop';
import { CartService } from './cart';
import { ShopProduct } from './catalog';
import { TEST_CATALOG, flushCatalog, provideCatalogTesting } from './catalog.testing';

describe('ShopComponent', () => {
  let products: readonly ShopProduct[];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [provideRouter([]), provideCatalogTesting()],
    }).compileComponents();
    products = (await flushCatalog()).products();
  });

  it('should select presentations and add separate variants with simulated prices', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const cart = TestBed.inject(CartService);
    expect(element.querySelector('.demo-notice')?.textContent).toContain('Precios simulados');
    expect(element.querySelector('.empty-cart')).not.toBeNull();
    element.querySelector<HTMLButtonElement>('.primary-button')!.click();
    element.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    expect(cart.count()).toBe(2);
    expect(cart.items()).toHaveLength(1);
    expect(cart.total()).toBe(56000);
    element.querySelector<HTMLInputElement>('input[value="labralma-340"]')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.product-price')?.textContent).toContain('36,000');
    element.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    expect(cart.items()).toHaveLength(2);
    expect(cart.total()).toBe(92000);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('340 g');
    expect(element.querySelectorAll('.cart-items li')).toHaveLength(2);
  });

  it('should update quantities, remove items at zero and clear the cart', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    const cart = TestBed.inject(CartService);
    cart.add(products[0], products[0].variants[0]);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-label^="Aumentar"]')!.click();
    await fixture.whenStable();
    expect(cart.count()).toBe(2);
    expect(cart.total()).toBe(56000);
    element.querySelector<HTMLButtonElement>('button[aria-label^="Reducir"]')!.click();
    await fixture.whenStable();
    expect(cart.count()).toBe(1);
    element.querySelector<HTMLButtonElement>('button[aria-label^="Reducir"]')!.click();
    await fixture.whenStable();
    expect(element.querySelector('.empty-cart')).not.toBeNull();
    expect(cart.total()).toBe(0);
    cart.add(products[0], products[0].variants[1]);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.remove-button')!.click();
    await fixture.whenStable();
    expect(cart.count()).toBe(0);
    cart.add(products[0], products[0].variants[0]);
    cart.add(products[0], products[0].variants[1]);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.clear-button')!.click();
    await fixture.whenStable();
    expect(cart.items()).toHaveLength(0);
    expect(cart.total()).toBe(0);
    expect(element.querySelector('.empty-cart')).not.toBeNull();
  });

  it('should open the cart drawer and close it with Escape', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const drawer = element.querySelector('.cart-drawer')!;
    const toggle = element.querySelector<HTMLButtonElement>('.cart-toggle')!;
    expect(drawer.classList).not.toContain('is-open');
    expect(drawer.hasAttribute('inert')).toBe(true);
    toggle.click();
    await fixture.whenStable();
    expect(drawer.classList).toContain('is-open');
    expect(drawer.hasAttribute('inert')).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(drawer.classList).not.toContain('is-open');
    expect(document.activeElement).toBe(toggle);
  });

  it('should charge simulated shipping until the free shipping threshold', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    const cart = TestBed.inject(CartService);
    const geisha = products.find((product) => product.name === 'Geisha')!;
    cart.add(products[0], products[0].variants[0]);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(cart.shipping()).toBe(9000);
    expect(cart.grandTotal()).toBe(37000);
    expect(element.querySelector('.shipping-progress')?.textContent).toContain('92,000');
    cart.add(geisha, geisha.variants[0]);
    cart.add(geisha, geisha.variants[0]);
    await fixture.whenStable();
    expect(cart.shipping()).toBe(0);
    expect(cart.grandTotal()).toBe(152000);
    expect(element.querySelector('.shipping-progress')?.textContent).toContain('envío gratis');
  });

  it('should filter products by category', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.product-card')).toHaveLength(products.length);
    const accessories = Array.from(
      element.querySelectorAll<HTMLButtonElement>('.filter-chip'),
    ).find((chip) => chip.textContent?.trim() === 'Accesorios')!;
    accessories.click();
    await fixture.whenStable();
    expect(accessories.getAttribute('aria-pressed')).toBe('true');
    expect(element.querySelectorAll('.product-card')).toHaveLength(
      products.filter((product) => product.category.id === 'accesorios').length,
    );
  });

  it('should restore the saved cart after a reload', async () => {
    const cart = TestBed.inject(CartService);
    cart.add(products[0], products[0].variants[1]);
    cart.increase(products[0].variants[1].id);
    TestBed.tick();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideCatalogTesting()] });
    const restored = TestBed.inject(CartService);
    expect(restored.items()).toHaveLength(0);
    await flushCatalog();
    expect(restored.count()).toBe(2);
    expect(restored.items()[0].variant.id).toBe('labralma-340');
  });

  it('should map the API response into one card per coffee profile', () => {
    expect(products.map((product) => product.name)).toEqual([
      'LabrAlma',
      'Mauritania · Lavado',
      'Mauritania · Honey',
      'Geisha',
      'Espresso Intenso',
      'Taza de cerámica',
    ]);
    expect(products[0].details).toBe('Heliconia - Antioquia · Lavado · 1740 m s. n. m.');
    expect(products[0].notes).toEqual(['Chocolate', 'Cítricos', 'Panela', 'Frutos rojos']);
    expect(products[0].variants.map((variant) => variant.label)).toEqual([
      '250 g · Grano',
      '340 g · Grano',
    ]);
    expect(products.at(-1)?.variants[0].label).toBe('300 ml');
    expect(TEST_CATALOG.items).toHaveLength(5);
  });

  it('should not allow adding sold out products', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const card = Array.from(element.querySelectorAll('.product-card')).find((item) =>
      item.textContent?.includes('Espresso Intenso'),
    )!;
    const button = card.querySelector<HTMLButtonElement>('.primary-button')!;
    expect(card.querySelector('.product-badge')?.textContent).toContain('Agotado');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Agotado');
  });

  it('should enlarge a product photo and close it again', async () => {
    // jsdom does not implement modal dialogs.
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector<HTMLDialogElement>('.image-dialog')!;
    element.querySelector<HTMLButtonElement>('.product-zoom')!.click();
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe(
      'images/productos/labralma-web.jpg',
    );
    expect(dialog.querySelector('figcaption')?.textContent).toContain('LabrAlma');
    const image = dialog.querySelector<HTMLImageElement>('.image-frame img')!;
    const zoomOut = dialog.querySelector<HTMLButtonElement>('button[aria-label="Alejar"]')!;
    expect(zoomOut.disabled).toBe(true);
    dialog
      .querySelector('.image-frame')!
      .dispatchEvent(new WheelEvent('wheel', { deltaY: -100, cancelable: true }));
    await fixture.whenStable();
    expect(image.style.transform).toContain('scale(1.25)');
    expect(dialog.querySelector('output')?.textContent).toContain('125%');
    dialog.querySelector<HTMLButtonElement>('button[aria-label="Acercar"]')!.click();
    await fixture.whenStable();
    expect(image.style.transform).toContain('scale(1.5625)');
    zoomOut.click();
    zoomOut.click();
    await fixture.whenStable();
    expect(image.style.transform).toContain('scale(1)');
    expect(zoomOut.disabled).toBe(true);
    dialog.querySelector<HTMLButtonElement>('.image-dialog-close')!.click();
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
    expect(dialog.querySelector('img')).toBeNull();
  });

  it('should limit the tasting notes shown on a card', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const notes = Array.from(
      element.querySelectorAll('.product-card')[0].querySelectorAll('.product-notes li'),
    );
    expect(notes.map((note) => note.textContent?.trim())).toEqual([
      'Chocolate',
      'Cítricos',
      'Panela',
      '+1',
    ]);
    expect(notes[3].getAttribute('title')).toBe('Frutos rojos');
  });

  it('should briefly confirm on the button that the product was added', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('.add-button')!;
    expect(button.textContent).toContain('Añadir al carrito');
    button.click();
    await fixture.whenStable();
    expect(button.classList).toContain('is-added');
    expect(button.textContent).toContain('Añadido');
  });
});
