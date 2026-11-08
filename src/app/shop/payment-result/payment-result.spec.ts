import { TestBed } from '@angular/core/testing';
import { ORDERS_API_URL, Order, OrderStatus } from '../checkout';
import { PaymentResultComponent } from './payment-result';

const ORDER: Order = {
  reference: 'CNR-ABC123',
  status: 'APPROVED',
  subtotal: 38000,
  shipping_cost: 0,
  total: 38000,
  payment_method: 'CARD',
  pickup_code: 'K7P4QX',
  picked_up_at: null,
};

describe('PaymentResultComponent', () => {
  function render(status: OrderStatus, order: Order) {
    TestBed.configureTestingModule({
      providers: [{ provide: ORDERS_API_URL, useValue: 'http://test/orders' }],
    });
    const fixture = TestBed.createComponent(PaymentResultComponent);
    fixture.componentRef.setInput('status', status);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the pickup code and its QR for a paid pickup order', () => {
    const element = render('APPROVED', ORDER);
    expect(element.querySelector('.pickup-code')?.textContent).toContain('K7P-4QX');
    const qr = element.querySelector<HTMLImageElement>('.pickup-qr')!;
    expect(qr.getAttribute('src')).toBe('http://test/orders/CNR-ABC123/pickup-qr.png');
    expect(qr.alt).toContain('K7P-4QX');
  });

  it('should not show a pickup code for home deliveries or unpaid orders', () => {
    expect(render('APPROVED', { ...ORDER, pickup_code: null }).querySelector('.pickup')).toBeNull();
    TestBed.resetTestingModule();
    expect(render('PENDING', ORDER).querySelector('.pickup')).toBeNull();
  });
});
