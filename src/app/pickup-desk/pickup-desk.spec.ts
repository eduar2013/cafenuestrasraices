import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ORDERS_API_URL } from '../shop/checkout';
import {
  PickupDeskComponent,
  PickupOrder,
  STAFF_KEY_STORAGE,
  normalizePickupCode,
} from './pickup-desk';

const ORDERS_URL = 'http://test/orders';
const ORDER: PickupOrder = {
  reference: 'CNR-ABC123',
  status: 'APPROVED',
  subtotal: 38000,
  shipping_cost: 0,
  total: 38000,
  payment_method: 'NEQUI',
  pickup_code: 'K7P4QX',
  picked_up_at: null,
  customer_name: 'Ana Gómez',
  customer_phone: '3001234567',
  created_at: '2026-11-08T10:00:00Z',
  items: [
    {
      sku: 'MAU-LAV-340-G',
      product_name: 'Mauritania Lavado',
      variant_name: '340 g · Grano',
      unit_price: 38000,
      quantity: 1,
    },
  ],
};
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('PickupDeskComponent', () => {
  let http: HttpTestingController;

  function render(code: string | null, savedKey: string | null = 'clave') {
    localStorage.clear();
    if (savedKey) {
      localStorage.setItem(STAFF_KEY_STORAGE, savedKey);
    }
    const params = new BehaviorSubject<ParamMap>(convertToParamMap(code ? { code } : {}));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ORDERS_API_URL, useValue: ORDERS_URL },
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PickupDeskComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  async function showOrder(order: PickupOrder = ORDER) {
    const view = render('K7P4QX');
    http.expectOne(`${ORDERS_URL}/pickup/K7P4QX`).flush(order);
    await settle();
    view.fixture.detectChanges();
    return view;
  }

  afterEach(() => {
    http?.verify();
    localStorage.clear();
  });

  it('should normalize what the buyer dictates', () => {
    expect(normalizePickupCode(' k7p-4qx ')).toBe('K7P4QX');
    expect(normalizePickupCode('K7P 4QX')).toBe('K7P4QX');
  });

  it('should ask for the staff key before showing anything', async () => {
    const { fixture, element } = render('K7P4QX', null);
    http.expectNone(`${ORDERS_URL}/pickup/K7P4QX`);

    element.querySelector<HTMLInputElement>('#staff-key')!.value = 'secreta';
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    const request = http.expectOne(`${ORDERS_URL}/pickup/K7P4QX`);
    expect(request.request.headers.get('X-API-Key')).toBe('secreta');
    expect(localStorage.getItem(STAFF_KEY_STORAGE)).toBe('secreta');
    request.flush(ORDER);
    await settle();
    fixture.detectChanges();
    expect(element.textContent).toContain('Ana Gómez');
  });

  it('should show the scanned order and mark it as delivered', async () => {
    const { fixture, element } = await showOrder();
    expect(element.textContent).toContain('listo para entregar');
    expect(element.textContent).toContain('Mauritania Lavado');
    expect(element.textContent).toContain('3001234567');
    expect(element.querySelector<HTMLInputElement>('#pickup-code')!.value).toBe('K7P-4QX');

    element.querySelector<HTMLButtonElement>('.desk-deliver')!.click();
    const deliver = http.expectOne(`${ORDERS_URL}/pickup/K7P4QX/deliver`);
    expect(deliver.request.method).toBe('POST');
    expect(deliver.request.headers.get('X-API-Key')).toBe('clave');
    deliver.flush({ ...ORDER, picked_up_at: '2026-11-08T15:15:00Z' });
    await settle();
    fixture.detectChanges();

    expect(element.textContent).toContain('Entregado el');
    expect(element.querySelector('.desk-deliver')).toBeNull();
  });

  it('should explain when the order was already handed over', async () => {
    const { fixture, element } = await showOrder();
    element.querySelector<HTMLButtonElement>('.desk-deliver')!.click();
    http
      .expectOne(`${ORDERS_URL}/pickup/K7P4QX/deliver`)
      .flush(
        { detail: 'Already picked up at 2026-11-08T15:15+00:00' },
        { status: 409, statusText: 'Conflict' },
      );
    await settle();
    http
      .expectOne(`${ORDERS_URL}/pickup/K7P4QX`)
      .flush({ ...ORDER, picked_up_at: '2026-11-08T15:15:00Z' });
    await settle();
    fixture.detectChanges();

    expect(element.textContent).toContain('Este pedido ya fue entregado.');
    expect(element.querySelector('.desk-deliver')).toBeNull();
  });

  it('should warn and not offer delivery for unpaid orders', async () => {
    const { element } = await showOrder({ ...ORDER, status: 'PENDING' });
    expect(element.textContent).toContain('no lo entregues');
    expect(element.querySelector('.desk-deliver')).toBeNull();
  });

  it('should say when the code does not exist', async () => {
    const { fixture, element } = render('ZZZZZZ');
    http
      .expectOne(`${ORDERS_URL}/pickup/ZZZZZZ`)
      .flush({ detail: 'Pickup code not found' }, { status: 404, statusText: 'Not Found' });
    await settle();
    fixture.detectChanges();
    expect(element.textContent).toContain('No existe un pedido con ese código.');
  });

  it('should forget a wrong key and ask again', async () => {
    const { fixture, element } = render('K7P4QX', 'vieja');
    http
      .expectOne(`${ORDERS_URL}/pickup/K7P4QX`)
      .flush({ detail: 'Invalid or missing API key' }, { status: 401, statusText: 'Unauthorized' });
    await settle();
    fixture.detectChanges();
    expect(localStorage.getItem(STAFF_KEY_STORAGE)).toBeNull();
    expect(element.querySelector('#staff-key')).not.toBeNull();
    expect(element.textContent).toContain('La clave no es válida');
  });

  it('should open the page of a typed code', () => {
    const { element } = render(null);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    element.querySelector<HTMLInputElement>('#pickup-code')!.value = 'k7p-4qx';
    element.querySelector<HTMLFormElement>('.desk-search')!.dispatchEvent(new Event('submit'));
    expect(navigate).toHaveBeenCalledWith(['/retiro', 'K7P4QX']);
  });
});
