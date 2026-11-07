import { TestBed } from '@angular/core/testing';
import { PaymentBadgeComponent, WOMPI_LOGO } from './payment-badge';

describe('PaymentBadgeComponent', () => {
  it('should show the Wompi logo and fall back to the name if it cannot load', async () => {
    const fixture = TestBed.createComponent(PaymentBadgeComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const logo = element.querySelector<HTMLImageElement>('.wompi-logo')!;

    expect(logo.getAttribute('src')).toBe(WOMPI_LOGO);
    expect(logo.alt).toBe('Wompi');
    expect(element.textContent).toContain('Tarjetas, PSE, Nequi');

    logo.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(element.querySelector('.wompi-logo')).toBeNull();
    expect(element.querySelector('.wompi-name')?.textContent).toBe('Wompi');
  });

  it('should hide the payment methods in compact mode', async () => {
    const fixture = TestBed.createComponent(PaymentBadgeComponent);
    fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.classList).toContain('is-compact');
    expect(element.querySelector('.badge-detail')).toBeNull();
  });
});
