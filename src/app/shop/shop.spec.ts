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
    expect(element.querySelector('app-payment-badge')?.textContent).toContain('Pago seguro con');
    expect(element.querySelector('.empty-cart')).not.toBeNull();
    element.querySelector<HTMLButtonElement>('.primary-button')!.click();
    element.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    expect(cart.count()).toBe(2);
    expect(cart.items()).toHaveLength(1);
    expect(cart.total()).toBe(56000);
    const weightGroup = element.querySelector<HTMLElement>(
      '[role="group"][aria-label="Gramaje de LabrAlma"]',
    )!;
    Array.from(weightGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
      .find((input) => input.value === '340')!
      .click();
    await fixture.whenStable();
    expect(element.querySelector('.product-price')?.textContent).toContain('36,000');
    const presentationGroup = element.querySelector<HTMLElement>(
      '[role="group"][aria-label="Presentación de LabrAlma"]',
    )!;
    Array.from(presentationGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
      .find((input) => input.value === 'molido')!
      .click();
    await fixture.whenStable();
    expect(element.querySelector('.product-price')?.textContent).toContain('38,000');
    expect(
      Array.from(weightGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]')).map(
        (input) => input.value,
      ),
    ).toEqual(['250', '340']);
    expect(
      Array.from(weightGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]')).find(
        (input) => input.value === '340',
      )?.checked,
    ).toBe(true);
    element.querySelector<HTMLButtonElement>('.primary-button')!.click();
    await fixture.whenStable();
    expect(cart.items()).toHaveLength(2);
    expect(cart.total()).toBe(94000);
    expect(cart.items().some((item) => item.variant.id === 'labralma-340-molido')).toBe(true);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('340 g molido');
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

  it('should show how much is missing for free shipping', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    const cart = TestBed.inject(CartService);
    const geisha = products.find((product) => product.name === 'Geisha')!;
    cart.add(products[0], products[0].variants[0]);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(cart.freeShippingRemaining()).toBe(92000);
    expect(element.querySelector('.shipping-progress')?.textContent).toContain('92,000');
    expect(element.querySelector('.cart-summary')?.textContent).toContain(
      'Se calcula con tu dirección',
    );
    cart.add(geisha, geisha.variants[0]);
    cart.add(geisha, geisha.variants[0]);
    await fixture.whenStable();
    expect(cart.freeShippingRemaining()).toBe(0);
    expect(element.querySelector('.shipping-progress')?.textContent).toContain('envío gratis');
  });

  it('should show the contact bar with the menu but without the shop link', async () => {
    const fixture = TestBed.createComponent(ShopComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-contact-bar')).not.toBeNull();
    expect(element.querySelector('app-contact-bar .shop-cta')).toBeNull();
    expect(element.querySelector('app-contact-bar a[aria-label="WhatsApp"]')).not.toBeNull();
    expect(element.querySelector('app-contact-bar app-side-nav button')).not.toBeNull();
  });

  it('should publish the contact bar height for the sticky toolbar', async () => {
    const observed: Element[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        observe(element: Element) {
          observed.push(element);
          this.callback();
        }
        disconnect() {}
      },
    );
    try {
      const fixture = TestBed.createComponent(ShopComponent);
      await fixture.whenStable();

      expect(observed[0]?.tagName).toBe('APP-CONTACT-BAR');
      expect(document.documentElement.style.getPropertyValue('--contact-bar-height')).toMatch(
        /^\d+px$/,
      );
      fixture.destroy();
    } finally {
      vi.unstubAllGlobals();
      document.documentElement.style.removeProperty('--contact-bar-height');
    }
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

  it('should map the API response into one card per product', () => {
    expect(products.map((product) => product.name)).toEqual([
      'LabrAlma',
      'Mauritania Lavado',
      'Mauritania Honey',
      'Geisha',
      'Espresso Intenso',
      'Taza de cerámica',
    ]);
    expect(products[0].properties).toEqual([
      { label: 'Variedad', value: 'Bourbon Papayo' },
      { label: 'Proceso', value: 'Lavado' },
      { label: 'Altura', value: '1740 m s. n. m.' },
    ]);
    expect(products[0].notes).toEqual(['Chocolate', 'Cítricos', 'Panela', 'Frutos rojos']);
    expect(products[0].variants.map((variant) => variant.label)).toEqual([
      '250 g grano',
      '340 g grano',
      '500 g grano',
      '250 g molido',
      '340 g molido',
    ]);
    expect(products[0].variants.map((variant) => variant.weight)).toEqual([
      250, 340, 500, 250, 340,
    ]);
    expect(products[0].variants.map((variant) => variant.presentation)).toEqual([
      'grano',
      'grano',
      'grano',
      'molido',
      'molido',
    ]);
    expect(products.at(-1)?.properties).toEqual([]);
    expect(products.at(-1)?.variants[0].label).toBe('300 ml');
    expect(TEST_CATALOG.items).toHaveLength(6);
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
    const card = element.querySelector('.product-card')!;
    const thumbnails = card.querySelectorAll<HTMLButtonElement>('.product-thumbnail');
    expect(thumbnails).toHaveLength(2);
    expect(thumbnails[0].getAttribute('aria-pressed')).toBe('true');
    thumbnails[1].click();
    await fixture.whenStable();
    expect(card.querySelector<HTMLImageElement>('.product-photo')?.src).toContain(
      'labralma-lifestyle.jpg',
    );
    element.querySelector<HTMLButtonElement>('.product-zoom')!.click();
    await fixture.whenStable();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe(
      'images/productos/labralma-lifestyle.jpg',
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
});
