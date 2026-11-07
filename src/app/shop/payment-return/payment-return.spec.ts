import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CartService } from '../cart';
import { TEST_CATALOG_URL, flushCatalog, provideCatalogTesting } from '../catalog.testing';
import {
  CheckoutCustomer,
  CheckoutShipping,
  ORDERS_API_URL,
  Order,
  WompiCheckout,
  webCheckoutUrl,
} from '../checkout';
import { PaymentReturnComponent } from './payment-return';

const ORDERS_URL = 'http://test/orders';
const ORDER: Order = {
  reference: 'CNR-ABC123',
  status: 'PENDING',
  subtotal: 28000,
  shipping_cost: 9000,
  total: 37000,
  payment_method: null,
};
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('PaymentReturnComponent', () => {
  let http: HttpTestingController;

  async function setup(query: Record<string, string>) {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideCatalogTesting(),
        { provide: ORDERS_API_URL, useValue: ORDERS_URL },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const [labralma] = (await flushCatalog()).products();
    TestBed.inject(CartService).add(labralma, labralma.variants[0]);
  }

  afterEach(() => sessionStorage.clear());

  it('should confirm the transaction Wompi sends back and empty the cart', async () => {
    await setup({ id: 'tx-9' });
    sessionStorage.setItem('cnr-pending-order', 'CNR-ABC123');
    const fixture = TestBed.createComponent(PaymentReturnComponent);
    fixture.detectChanges();
    await settle();

    const sync = http.expectOne(`${ORDERS_URL}/CNR-ABC123/sync`);
    expect(sync.request.body).toEqual({ transaction_id: 'tx-9' });
    sync.flush({ ...ORDER, status: 'APPROVED' });
    await settle();
    TestBed.tick();
    http.expectOne(TEST_CATALOG_URL).flush({ total: 0, items: [] });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.payment-result h3')?.textContent).toContain('Pago aprobado');
    expect(TestBed.inject(CartService).count()).toBe(0);
    expect(sessionStorage.getItem('cnr-pending-order')).toBeNull();
  });

  it('should keep the cart when the payment was declined', async () => {
    await setup({ id: 'tx-9' });
    sessionStorage.setItem('cnr-pending-order', 'CNR-ABC123');
    const fixture = TestBed.createComponent(PaymentReturnComponent);
    fixture.detectChanges();
    await settle();
    http.expectOne(`${ORDERS_URL}/CNR-ABC123/sync`).flush({ ...ORDER, status: 'DECLINED' });
    await settle();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.payment-result h3')?.textContent).toContain('no fue aprobado');
    expect(TestBed.inject(CartService).count()).toBe(1);
  });

  it('should explain when the order is not known in this browser', async () => {
    await setup({ id: 'tx-9' });
    const fixture = TestBed.createComponent(PaymentReturnComponent);
    await fixture.whenStable();

    http.expectNone(`${ORDERS_URL}/CNR-ABC123/sync`);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No encontramos tu pedido',
    );
  });
});

describe('webCheckoutUrl', () => {
  it('should send the signed amount and the buyer data to Wompi', () => {
    const checkout: WompiCheckout = {
      public_key: 'pub_test_llave',
      currency: 'COP',
      amount_in_cents: 3700000,
      reference: 'CNR-ABC123',
      signature: 'firma',
    };
    const customer: CheckoutCustomer = {
      full_name: 'Ana Gómez',
      email: 'ana@example.com',
      phone: '3001234567',
    };
    const shipping: CheckoutShipping = {
      address: 'Calle 10 # 20-30',
      address_detail: null,
      city: 'Medellín',
      department: 'Antioquia',
    };
    const url = new URL(
      webCheckoutUrl(checkout, customer, shipping, 'http://tienda/#/pago/resultado'),
    );

    expect(url.origin + url.pathname).toBe('https://checkout.wompi.co/p/');
    expect(url.searchParams.get('public-key')).toBe('pub_test_llave');
    expect(url.searchParams.get('amount-in-cents')).toBe('3700000');
    expect(url.searchParams.get('reference')).toBe('CNR-ABC123');
    expect(url.searchParams.get('signature:integrity')).toBe('firma');
    expect(url.searchParams.get('redirect-url')).toBe('http://tienda/#/pago/resultado');
    expect(url.searchParams.get('customer-data:email')).toBe('ana@example.com');
    expect(url.searchParams.get('shipping-address:city')).toBe('Medellín');
    expect(url.searchParams.has('shipping-address:address-line-2')).toBe(false);
  });
});
