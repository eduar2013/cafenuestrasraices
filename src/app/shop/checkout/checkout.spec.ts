import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CartService } from '../cart';
import { TEST_CATALOG_URL, flushCatalog, provideCatalogTesting } from '../catalog.testing';
import { CheckoutResponse, CheckoutService, ORDERS_API_URL, Order, OrderStatus } from '../checkout';
import { CheckoutComponent } from './checkout';

const ORDERS_URL = 'http://test/orders';

const ORDER: Order = {
  reference: 'CNR-ABC123',
  status: 'PENDING',
  subtotal: 28000,
  shipping_cost: 9000,
  total: 37000,
  payment_method: null,
};

const CREATED: CheckoutResponse = {
  order: ORDER,
  wompi: {
    public_key: 'pub_test_llave',
    currency: 'COP',
    amount_in_cents: 3700000,
    reference: ORDER.reference,
    signature: 'firma',
  },
};

/** Lets pending promises (HTTP answers, awaits) settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('CheckoutComponent', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideCatalogTesting(), { provide: ORDERS_API_URL, useValue: ORDERS_URL }],
    });
    http = TestBed.inject(HttpTestingController);
    const [labralma] = (await flushCatalog()).products();
    TestBed.inject(CartService).add(labralma, labralma.variants[0]);
  });

  async function render(widgetStatus: OrderStatus = 'APPROVED', { redirect = false } = {}) {
    const service = TestBed.inject(CheckoutService);
    vi.spyOn(service, 'prefersRedirect').mockReturnValue(redirect);
    const redirectToWompi = vi.spyOn(service, 'redirectToWompi').mockImplementation(() => {});
    const openWidget = vi
      .spyOn(service, 'openWidget')
      .mockResolvedValue({ id: 'tx-1', status: widgetStatus });
    const fixture = TestBed.createComponent(CheckoutComponent);
    const events: string[] = [];
    fixture.componentInstance.paymentOpened.subscribe(() => events.push('opened'));
    fixture.componentInstance.paymentReturned.subscribe(() => events.push('returned'));
    await fixture.whenStable();
    return {
      fixture,
      element: fixture.nativeElement as HTMLElement,
      openWidget,
      redirectToWompi,
      events,
    };
  }

  function fillForm(fixture: { componentInstance: CheckoutComponent }) {
    fixture.componentInstance.form.setValue({
      full_name: 'Ana Gómez',
      email: 'ana@example.com',
      phone: '3001234567',
      address: 'Calle 10 # 20-30',
      address_detail: '',
      city: 'Medellín',
      department: 'Antioquia',
    });
  }

  async function submit(fixture: { detectChanges(): void }, element: HTMLElement) {
    element.querySelector<HTMLButtonElement>('.pay-button')!.click();
    fixture.detectChanges();
    await settle();
  }

  it('should create the order, open Wompi and confirm an approved payment', async () => {
    const { fixture, element, openWidget, events } = await render('APPROVED');
    fillForm(fixture);
    await submit(fixture, element);

    const create = http.expectOne({ method: 'POST', url: ORDERS_URL });
    // Only SKUs and quantities are sent: the API sets the prices.
    expect(create.request.body).toEqual({
      items: [{ sku: 'labralma-250', quantity: 1 }],
      customer: { full_name: 'Ana Gómez', email: 'ana@example.com', phone: '3001234567' },
      shipping: {
        address: 'Calle 10 # 20-30',
        address_detail: null,
        city: 'Medellín',
        department: 'Antioquia',
      },
    });
    create.flush(CREATED);
    await settle();

    expect(openWidget).toHaveBeenCalledWith(CREATED.wompi, expect.anything(), expect.anything());
    // The cart steps aside while Wompi's window is open, and comes back for the result.
    expect(events).toEqual(['opened', 'returned']);
    const sync = http.expectOne(`${ORDERS_URL}/CNR-ABC123/sync`);
    expect(sync.request.body).toEqual({ transaction_id: 'tx-1' });
    sync.flush({ ...ORDER, status: 'APPROVED', payment_method: 'CARD' });
    await settle();
    // The catalog is reloaded to show the new stock.
    http.expectOne(TEST_CATALOG_URL).flush({ total: 0, items: [] });
    await fixture.whenStable();

    expect(element.querySelector('.payment-result h3')?.textContent).toContain('Pago aprobado');
    expect(element.textContent).toContain('CNR-ABC123');
    expect(TestBed.inject(CartService).count()).toBe(0);
  });

  it('should keep the cart and offer a retry when the payment is declined', async () => {
    const { fixture, element } = await render('DECLINED');
    fillForm(fixture);
    await submit(fixture, element);
    http.expectOne(ORDERS_URL).flush(CREATED);
    await settle();
    http.expectOne(`${ORDERS_URL}/CNR-ABC123/sync`).flush({ ...ORDER, status: 'DECLINED' });
    await fixture.whenStable();

    expect(element.querySelector('.payment-result h3')?.textContent).toContain('no fue aprobado');
    expect(TestBed.inject(CartService).count()).toBe(1);
    element.querySelector<HTMLButtonElement>('.result-button')!.click();
    await fixture.whenStable();
    expect(element.querySelector('form')).not.toBeNull();
    expect(fixture.componentInstance.form.controls.email.value).toBe('ana@example.com');
  });

  it('should send phones to the Wompi payment page instead of the window', async () => {
    const { fixture, element, openWidget, redirectToWompi, events } = await render('APPROVED', {
      redirect: true,
    });
    fillForm(fixture);
    await submit(fixture, element);
    http.expectOne(ORDERS_URL).flush(CREATED);
    await settle();
    await fixture.whenStable();

    expect(redirectToWompi).toHaveBeenCalledWith(
      CREATED.wompi,
      expect.objectContaining({ email: 'ana@example.com' }),
      expect.objectContaining({ city: 'Medellín' }),
    );
    expect(openWidget).not.toHaveBeenCalled();
    expect(events).toEqual([]);
    expect(element.querySelector('.pay-button')?.textContent).toContain('Te llevamos a Wompi');
  });

  it('should explain when there is not enough stock', async () => {
    const { fixture, element, openWidget } = await render();
    fillForm(fixture);
    await submit(fixture, element);
    http
      .expectOne(ORDERS_URL)
      .flush({ detail: 'Not enough stock' }, { status: 409, statusText: 'Conflict' });
    await settle();
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('inventario');
    expect(openWidget).not.toHaveBeenCalled();
  });

  it('should validate the form before creating anything', async () => {
    const { fixture, element } = await render();
    await submit(fixture, element);
    await fixture.whenStable();

    http.expectNone(ORDERS_URL);
    expect(element.querySelectorAll('.field-error').length).toBeGreaterThan(0);
    expect(element.textContent).toContain('Escribe un correo válido');
  });
});
