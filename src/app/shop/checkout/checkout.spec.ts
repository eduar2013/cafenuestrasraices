import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartService } from '../cart';
import { TEST_CATALOG_URL, flushCatalog, provideCatalogTesting } from '../catalog.testing';
import {
  CheckoutResponse,
  CheckoutService,
  ORDERS_API_URL,
  Order,
  OrderStatus,
  PickupInfo,
  SHIPPING_API_URL,
  ShippingQuote,
} from '../checkout';
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from '../../legal/legal';
import { CheckoutComponent } from './checkout';

const ORDERS_URL = 'http://test/orders';
const QUOTE_URL = 'http://test/shipping/quote';
const PICKUP_URL = 'http://test/shipping/pickup';
const PICKUP: PickupInfo = {
  address: 'Calle 72 Sur #46 A 35, Sabaneta, Antioquia',
  hours: 'Lunes a domingo, 8:00 a.m. – 9:00 p.m.',
  option: {
    id: 'tienda:retiro',
    carrier: 'tienda',
    service: 'retiro',
    description: 'Recoger en la tienda',
    delivery_estimate: null,
    price: 0,
  },
};

const QUOTE: ShippingQuote = {
  free_shipping: false,
  options: [
    {
      id: 'servientrega:express',
      carrier: 'servientrega',
      service: 'express',
      description: 'Servientrega · Express',
      delivery_estimate: '1-2 días',
      price: 11900,
    },
    {
      id: 'coordinadora:ground',
      carrier: 'coordinadora',
      service: 'ground',
      description: 'Coordinadora · Terrestre',
      delivery_estimate: '2-3 días',
      price: 14350,
    },
  ],
};

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
      providers: [
        provideRouter([]),
        provideCatalogTesting(),
        { provide: ORDERS_API_URL, useValue: ORDERS_URL },
        { provide: SHIPPING_API_URL, useValue: 'http://test/shipping' },
      ],
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
    http.expectOne(PICKUP_URL).flush(PICKUP);
    await settle();
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
      accept_terms: true,
      accept_privacy: true,
    });
  }

  /** Clicks pay; if the form is complete the shipping quote is answered with QUOTE. */
  async function submit(fixture: { detectChanges(): void }, element: HTMLElement) {
    element.querySelector<HTMLButtonElement>('.pay-button')!.click();
    fixture.detectChanges();
    await settle();
    for (const request of http.match(QUOTE_URL)) {
      request.flush(QUOTE);
      await settle();
    }
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
      // The cheapest option is chosen by default; the API quotes its price again.
      shipping_option: 'servientrega:express',
      // The buyer's authorization travels with the versions of the texts they accepted.
      consent: {
        privacy_accepted: true,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
        terms_accepted: true,
        terms_version: TERMS_VERSION,
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
    TestBed.tick();
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
    await settle();
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

  it('should quote shipping for the address and add the chosen option to the total', async () => {
    const { fixture, element } = await render();
    fillForm(fixture);
    element.querySelector('select')!.dispatchEvent(new Event('change'));
    await settle();

    const quote = http.expectOne(QUOTE_URL);
    expect(quote.request.body).toEqual({
      items: [{ sku: 'labralma-250', quantity: 1 }],
      shipping: {
        address: 'Calle 10 # 20-30',
        address_detail: null,
        city: 'Medellín',
        department: 'Antioquia',
      },
      customer: { full_name: 'Ana Gómez', email: 'ana@example.com', phone: '3001234567' },
    });
    quote.flush(QUOTE);
    await settle();
    await fixture.whenStable();

    const options = element.querySelectorAll<HTMLInputElement>('.shipping-option input');
    expect(options).toHaveLength(2);
    expect(options[0].checked).toBe(true);
    expect(element.querySelector('.shipping-option')?.textContent).toContain('1-2 días');
    expect(element.querySelector('.summary-total')?.textContent).toContain('39,900');

    options[1].click();
    await fixture.whenStable();
    expect(element.querySelector('.summary-total')?.textContent).toContain('42,350');
  });

  it('should disable paying and show a spinner while shipping is being quoted', async () => {
    const { fixture, element } = await render();
    fillForm(fixture);
    element.querySelector('select')!.dispatchEvent(new Event('change'));
    await settle();
    await fixture.whenStable();

    const pay = element.querySelector<HTMLButtonElement>('.pay-button')!;
    expect(pay.disabled).toBe(true);
    expect(pay.querySelector('.spinner')).not.toBeNull();
    expect(pay.textContent).toContain('Calculando el envío');
    expect(element.querySelector('.shipping-options .spinner')).not.toBeNull();
    expect(element.querySelector('.checkout-summary')?.textContent).toContain('Calculando');

    http.expectOne(QUOTE_URL).flush(QUOTE);
    await settle();
    await fixture.whenStable();
    expect(pay.disabled).toBe(false);
    expect(pay.querySelector('.spinner')).toBeNull();
    expect(pay.textContent).toContain('Pagar con Wompi');
    expect(element.querySelector('.shipping-options .spinner')).toBeNull();
  });

  it('should show why an address cannot be quoted', async () => {
    const { fixture, element } = await render();
    fillForm(fixture);
    element.querySelector('select')!.dispatchEvent(new Event('change'));
    await settle();
    http
      .expectOne(QUOTE_URL)
      .flush(
        { detail: 'No encontramos la ciudad «Medellín».' },
        { status: 422, statusText: 'Unprocessable Entity' },
      );
    await settle();
    await fixture.whenStable();

    expect(element.querySelector('.shipping-options')?.textContent).toContain(
      'No encontramos la ciudad',
    );
    expect(element.querySelector('.summary-total')?.textContent).toContain('28,000');
  });

  it('should let the buyer pick the order up at the shop without an address', async () => {
    const { fixture, element, openWidget } = await render('APPROVED');
    fixture.componentInstance.form.patchValue({
      full_name: 'Ana Gómez',
      email: 'ana@example.com',
      phone: '3001234567',
      accept_terms: true,
      accept_privacy: true,
    });
    element.querySelector<HTMLInputElement>('input[value="pickup"]')!.click();
    await fixture.whenStable();

    expect(element.querySelector('.pickup-info')?.textContent).toContain('Calle 72 Sur');
    expect(element.querySelector('input[formControlName="address"]')).toBeNull();
    expect(element.querySelector('.summary-total')?.textContent).toContain('28,000');

    await submit(fixture, element);
    http.expectNone(QUOTE_URL);
    const create = http.expectOne(ORDERS_URL);
    expect(create.request.body.shipping).toBeNull();
    expect(create.request.body.shipping_option).toBe('tienda:retiro');
    create.flush(CREATED);
    await settle();
    expect(openWidget).toHaveBeenCalledWith(CREATED.wompi, expect.anything(), null);
  });

  it('should validate the form before creating anything', async () => {
    const { fixture, element } = await render();
    await submit(fixture, element);
    await fixture.whenStable();

    http.expectNone(ORDERS_URL);
    expect(element.querySelectorAll('.field-error').length).toBeGreaterThan(0);
    expect(element.textContent).toContain('Escribe un correo válido');
  });

  it('should not create the order without the data authorization', async () => {
    const { fixture, element } = await render();
    fillForm(fixture);
    fixture.componentInstance.form.controls.accept_privacy.setValue(false);
    await submit(fixture, element);
    await fixture.whenStable();

    http.expectNone(ORDERS_URL);
    const errors = element.querySelectorAll('.consent .field-error');
    expect(errors).toHaveLength(1);
    expect(errors[0].textContent).toContain('Necesitamos tu autorización');
    expect(element.querySelector('.consent a[href*="privacidad"]')).not.toBeNull();
  });

  it('should not create the order without accepting the terms', async () => {
    const { fixture, element } = await render();
    fillForm(fixture);
    fixture.componentInstance.form.controls.accept_terms.setValue(false);
    await submit(fixture, element);
    await fixture.whenStable();

    http.expectNone(ORDERS_URL);
    const errors = element.querySelectorAll('.consent .field-error');
    expect(errors).toHaveLength(1);
    expect(errors[0].textContent).toContain('términos y condiciones');
    expect(element.querySelector('.consent a[href*="terminos"]')).not.toBeNull();
  });

  it('should show one checkbox for the terms and another for the privacy policy', async () => {
    const { element } = await render();
    const boxes = element.querySelectorAll<HTMLInputElement>('.consent input[type="checkbox"]');
    expect(boxes).toHaveLength(2);
    expect(boxes[0].closest('label')!.querySelector('a[href*="terminos"]')).not.toBeNull();
    expect(boxes[1].closest('label')!.querySelector('a[href*="privacidad"]')).not.toBeNull();
  });

  it('should not send name and phone to the shipping quote before the authorization', async () => {
    const { fixture, element } = await render();
    fillForm(fixture);
    fixture.componentInstance.form.controls.accept_privacy.setValue(false);
    element.querySelector('select')!.dispatchEvent(new Event('change'));
    await settle();

    expect(http.expectOne(QUOTE_URL).request.body.customer).toBeNull();
  });
});
