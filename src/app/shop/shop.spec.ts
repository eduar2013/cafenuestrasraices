import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShopComponent } from './shop';
import { CartService } from './cart';
import { SHOP_PRODUCTS } from './catalog';

describe('ShopComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [provideRouter([])],
    }).compileComponents();
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
    const select = element.querySelector('select')!;
    select.value = 'labralma-340';
    select.dispatchEvent(new Event('change'));
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
    cart.add(SHOP_PRODUCTS[0], SHOP_PRODUCTS[0].variants[0]);
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
    cart.add(SHOP_PRODUCTS[0], SHOP_PRODUCTS[0].variants[1]);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.remove-button')!.click();
    await fixture.whenStable();
    expect(cart.count()).toBe(0);
    cart.add(SHOP_PRODUCTS[0], SHOP_PRODUCTS[0].variants[0]);
    cart.add(SHOP_PRODUCTS[0], SHOP_PRODUCTS[0].variants[1]);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.clear-button')!.click();
    await fixture.whenStable();
    expect(cart.items()).toHaveLength(0);
    expect(cart.total()).toBe(0);
    expect(element.querySelector('.empty-cart')).not.toBeNull();
  });
});
