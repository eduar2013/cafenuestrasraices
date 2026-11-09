import { TestBed } from '@angular/core/testing';
import { ShopProduct, toShopProducts } from '../catalog';
import { TEST_CATALOG } from '../catalog.testing';
import { MAX_QUANTITY, ProductAddition, ProductCardComponent } from './product-card';

describe('ProductCardComponent', () => {
  const products = toShopProducts(TEST_CATALOG.items);
  const byName = (name: string) => products.find((product) => product.name === name)!;

  async function render(product: ShopProduct) {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', product);
    const added: ProductAddition[] = [];
    fixture.componentInstance.added.subscribe((addition) => added.push(addition));
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
    expect(added.map(({ variant, quantity }) => [variant.id, quantity])).toEqual([
      ['labralma-340-molido', 1],
    ]);
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

  it('should show origin and only three tasting notes on the card itself', async () => {
    const { element } = await render(byName('LabrAlma'));
    const lines = element.querySelector('.product-lines')!.textContent!;

    expect(element.querySelector('.product-origin')?.textContent).toContain('Heliconia, Antioquia');
    expect(lines).not.toContain('Lavado');
    expect(lines).toContain('Chocolate, Cítricos, Panela');
    expect(lines).not.toContain('Frutos rojos');
  });

  it('should open the full coffee sheet as a dialog instead of growing the card', async () => {
    const { element } = await render(byName('LabrAlma'));
    const sheet = element.querySelector<HTMLDialogElement>('dialog.product-sheet')!;
    // jsdom has no showModal; the card only needs to call it.
    sheet.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };

    expect(sheet.open).toBe(false);
    expect(sheet.textContent).toContain('Bourbon Papayo');
    expect(sheet.textContent).toContain('1740 m s. n. m.');
    expect(sheet.textContent).toContain('Frutos rojos');
    expect(sheet.textContent).toContain('Lavado');
    expect(sheet.querySelector('.sheet-lines')?.textContent).toContain('Presentación');
    element.querySelector<HTMLButtonElement>('.sheet-toggle')!.click();
    expect(sheet.open).toBe(true);
  });

  it('should not show a coffee sheet for products that are not coffee', async () => {
    const { element } = await render(byName('Taza de cerámica'));

    expect(element.querySelector('.product-sheet')).toBeNull();
    expect(element.querySelector('.product-lines')).toBeNull();
  });

  it('should add the chosen quantity and start again from one', async () => {
    const { fixture, element, added } = await render(byName('LabrAlma'));
    const input = element.querySelector<HTMLInputElement>('.quantity-picker input')!;
    const [less, more] = element.querySelectorAll<HTMLButtonElement>('.quantity-picker button');

    expect(less.disabled).toBe(true);
    more.click();
    more.click();
    await fixture.whenStable();
    expect(input.value).toBe('3');
    less.click();
    await fixture.whenStable();
    expect(input.value).toBe('2');

    element.querySelector<HTMLButtonElement>('.add-button')!.click();
    await fixture.whenStable();
    expect(added.map(({ quantity }) => quantity)).toEqual([2]);
    expect(input.value).toBe('1');
  });

  it('should keep a typed quantity between 1 and the maximum', async () => {
    const { fixture, element } = await render(byName('LabrAlma'));
    const input = element.querySelector<HTMLInputElement>('.quantity-picker input')!;
    const type = async (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };

    await type('5');
    expect(fixture.componentInstance.quantity()).toBe(5);
    await type('999');
    expect(input.value).toBe(`${MAX_QUANTITY}`);
    await type('0');
    expect(input.value).toBe('1');
    await type('');
    expect(input.value).toBe('1');
  });

  it('should disable the quantity for sold out products', async () => {
    const { element } = await render(byName('Espresso Intenso'));

    expect(element.querySelector<HTMLInputElement>('.quantity-picker input')!.disabled).toBe(true);
  });
});
