import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { CartService } from './shop/cart';
import { CatalogService } from './shop/catalog';
import { flushCatalog, provideCatalogTesting } from './shop/catalog.testing';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideCatalogTesting()],
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl('/');
    await flushCatalog();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should provide accessible side navigation to existing page sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('app-side-nav nav');
    const links = Array.from(nav?.querySelectorAll('a') ?? []);

    expect(nav?.getAttribute('aria-label')).toBe('Navegación por secciones');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/#inicio',
      '/#ubicacion',
      '/#prueba',
      '/#origenes',
      '/#historia',
      '/#productos',
      '/tienda',
    ]);
    for (const link of links) {
      const href = link.getAttribute('href')!;
      if (href === '/tienda') {
        continue;
      }
      const target = compiled.querySelector(href.slice(href.indexOf('#')));
      expect(target).not.toBeNull();
      expect(target?.getAttribute('tabindex')).toBe('-1');
      expect(link.getAttribute('aria-label')).toBeTruthy();
      expect(link.getAttribute('target')).toBeNull();
    }
  });

  it('should start closed and toggle the side navigation on click', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('app-side-nav button')!;
    const nav = compiled.querySelector<HTMLElement>('app-side-nav nav')!;

    expect(nav.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(nav.id);
    button.click();
    await fixture.whenStable();
    expect(nav.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Cerrar menú');
    button.click();
    await fixture.whenStable();
    expect(nav.hidden).toBe(true);
  });

  it('should place the menu in the contact bar right after WhatsApp', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const socials = compiled.querySelector('app-contact-bar .quick-social-group')!;

    expect(compiled.querySelectorAll('app-side-nav')).toHaveLength(1);
    expect(socials.lastElementChild?.tagName).toBe('APP-SIDE-NAV');
    expect(socials.lastElementChild?.previousElementSibling?.getAttribute('aria-label')).toBe(
      'WhatsApp',
    );
  });

  it('should close the menu when clicking outside of it', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('app-side-nav button')!;
    const nav = compiled.querySelector<HTMLElement>('app-side-nav nav')!;

    button.click();
    await fixture.whenStable();
    expect(nav.hidden).toBe(false);
    compiled.querySelector<HTMLElement>('app-cafe-history')!.click();
    await fixture.whenStable();
    expect(nav.hidden).toBe(true);
  });

  it('should close on selection or Escape and restore focus on Escape', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('app-side-nav button')!;
    const nav = compiled.querySelector<HTMLElement>('app-side-nav nav')!;
    const link = nav.querySelector<HTMLAnchorElement>('a')!;

    button.click();
    await fixture.whenStable();
    link.addEventListener('click', (event) => event.preventDefault(), { once: true });
    link.click();
    await fixture.whenStable();
    expect(nav.hidden).toBe(true);
    button.click();
    await fixture.whenStable();
    link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(nav.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.ownerDocument.activeElement).toBe(button);
  });

  it('should render the cafe history before the carousel', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const history = compiled.querySelector('app-cafe-history');
    expect(history?.querySelector('h2')?.textContent).toContain('Nuestra historia');
    expect(history?.compareDocumentPosition(compiled.querySelector('app-carousel')!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(history?.querySelector('img')?.getAttribute('src')).toBe('images/cafe/image.webp');
    expect(history?.querySelector('img')?.getAttribute('alt')).toBe('Logo de Café Nuestras Raíces');
  });

  it('should render a footer last with working section links and safe external links', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('app-footer footer')!;

    expect(compiled.lastElementChild?.tagName.toLowerCase()).toBe('app-footer');
    expect(footer.querySelector('h2')?.textContent).toBe('Enlaces de interés');
    expect(footer.textContent).toContain(String(new Date().getFullYear()));
    const links = Array.from(footer.querySelectorAll('a'));
    // 5 section links, WhatsApp, Instagram, Facebook, "Cómo llegar" and "Volver al inicio".
    expect(links.length).toBe(10);
    for (const link of links) {
      const href = link.getAttribute('href')!;
      if (href.startsWith('/#')) {
        expect(compiled.querySelector(href.slice(1))).not.toBeNull();
      } else if (href === '/tienda') {
        expect(link.textContent).toBe('Tienda');
      } else {
        expect(href.startsWith('https://')).toBe(true);
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      }
    }
  });

  it('should open the shop and retain the cart when returning from home', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shop-preview a')?.getAttribute('href')).toBe('/tienda');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/tienda');
    const catalog = TestBed.inject(CatalogService);
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toBe('Café de especialidad colombiano para preparar en casa');
    expect(compiled.querySelector('app-cafe-history')).toBeNull();
    const [product] = catalog.products();
    TestBed.inject(CartService).add(product, product.variants[0]);
    await router.navigateByUrl('/#historia');
    await fixture.whenStable();
    expect(compiled.querySelector('#historia')).not.toBeNull();
    await router.navigateByUrl('/tienda');
    await fixture.whenStable();
    expect(compiled.querySelector('#cart-title')?.textContent).toContain('(1)');
  });

  it('should place the logo above the story below the shared title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('app-cafe-history .history-content');

    expect(Array.from(content?.children ?? []).map((child) => child.className)).toEqual([
      'history-heading',
      'history-story',
      'history-video',
    ]);
    expect(content?.querySelector('.history-heading h2')?.id).toBe('history-title');
    expect(content?.querySelector('.history-heading .history-logo')).toBeNull();
    expect(content?.querySelector('.history-story')?.firstElementChild?.className).toBe(
      'history-logo',
    );
    expect(content?.querySelector('.history-story .history-logo img')).not.toBeNull();
    expect(content?.querySelector('.history-eyebrow')).toBeNull();
    expect(content?.querySelector('.history-story h2')).toBeNull();
  });

  it('should play the history video from the project files', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const video = compiled.querySelector('app-cafe-history video');

    expect(compiled.querySelector('app-cafe-history iframe')).toBeNull();
    expect(video?.getAttribute('src')).toBe('videos/historia.mp4#t=0.1');
    expect(video?.getAttribute('aria-label')).toContain('Café Nuestras Raíces');
    expect(video?.hasAttribute('controls')).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
  });
});
