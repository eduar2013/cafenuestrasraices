import { TestBed } from '@angular/core/testing';
import { ProductVariant, ShopProduct, toShopProducts } from '../catalog';
import { TEST_CATALOG } from '../catalog.testing';
import { ProductCardComponent } from './product-card';

describe('ProductCardComponent', () => {
  const products = toShopProducts(TEST_CATALOG.items);
  const byName = (name: string) => products.find((product) => product.name === name)!;

  async function render(product: ShopProduct) {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', product);
    const added: ProductVariant[] = [];
    fixture.componentInstance.added.subscribe((variant) => added.push(variant));
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement, added };
  }

  function radio(element: HTMLElement, group: string, value: string) {
    return Array.from(
      element.querySelectorAll<HTMLInputElement>(`[aria-label="${group}"] input[type="radio"]`),
    ).find((input) => input.value === value)!;
  }

  it('should emit the selected presentation and weight when added', async () => {
    const { fixture, element, added } = await render(byName('LabrAlma'));

    radio(element, 'Presentación de LabrAlma', 'molido').click();
    await fixture.whenStable();
    // Grano 250 g → molido keeps 250 g, which exists for molido too.
    expect(element.querySelector('.product-price')?.textContent).toContain('30,000');
    radio(element, 'Gramaje de LabrAlma', '340').click();
    await fixture.whenStable();
    expect(element.querySelector('.product-price')?.textContent).toContain('38,000');

    element.querySelector<HTMLButtonElement>('.add-button')!.click();
    expect(added.map((variant) => variant.id)).toEqual(['labralma-340-molido']);
  });

  it('should show a selected radio when only one option is available', async () => {
    const { element } = await render(byName('Geisha'));

    expect(radio(element, 'Presentación de Geisha', 'grano').checked).toBe(true);
    expect(radio(element, 'Gramaje de Geisha', '250').checked).toBe(true);
  });

  it('should briefly confirm on the button that the product was added', async () => {
    const { fixture, element } = await render(byName('LabrAlma'));
    const button = element.querySelector<HTMLButtonElement>('.add-button')!;

    expect(button.textContent).toContain('Añadir al carrito');
    button.click();
    await fixture.whenStable();
    expect(button.classList).toContain('is-added');
    expect(button.textContent).toContain('Añadido');
  });

  it('should not emit for sold out products', async () => {
    const { element, added } = await render(byName('Espresso Intenso'));
    const button = element.querySelector<HTMLButtonElement>('.add-button')!;

    expect(element.querySelector('.product-badge')?.textContent).toContain('Agotado');
    expect(button.disabled).toBe(true);
    button.click();
    expect(added).toEqual([]);
  });

  it('should ask to enlarge the photo that is currently shown', async () => {
    const { fixture, element } = await render(byName('LabrAlma'));
    const zoomed: string[] = [];
    fixture.componentInstance.zoom.subscribe((image) => zoomed.push(image));

    element.querySelectorAll<HTMLButtonElement>('.product-thumbnail')[1].click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.product-zoom')!.click();
    expect(zoomed).toEqual(['images/productos/labralma-lifestyle.jpg']);
  });

  it('should flip coffee cards to show the description and tasting notes', async () => {
    const { fixture, element } = await render(byName('LabrAlma'));
    const card = element.querySelector('.product-card')!;
    const back = element.querySelector('.product-back')!;
    const button = element.querySelector<HTMLButtonElement>('.product-title .flip-button')!;

    expect(button.textContent).toContain('Ver más');
    expect(back.hasAttribute('inert')).toBe(true);
    expect(
      Array.from(back.querySelectorAll('.back-notes li')).map((note) => note.textContent),
    ).toEqual(['Chocolate', 'Cítricos', 'Panela', 'Frutos rojos']);

    button.click();
    await fixture.whenStable();
    expect(card.classList).toContain('is-flipped');
    expect(button.textContent).toContain('Volver');
    expect(back.hasAttribute('inert')).toBe(false);
    expect(element.querySelector('.product-front')!.hasAttribute('inert')).toBe(true);
    // Photo, price and add button stay usable on both sides.
    expect(element.querySelector('.add-button')!.closest('[inert]')).toBeNull();

    button.click();
    await fixture.whenStable();
    expect(card.classList).not.toContain('is-flipped');
    expect(button.textContent).toContain('Ver más');
  });

  it('should not offer the flip for products that are not coffee', async () => {
    const { element } = await render(byName('Taza de cerámica'));

    expect(element.querySelector('.flip-button')).toBeNull();
    expect(element.querySelector('.product-back')).toBeNull();
  });
});
