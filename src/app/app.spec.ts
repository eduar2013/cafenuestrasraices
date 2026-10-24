import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { CartService } from './shop/cart';
import { SHOP_PRODUCTS } from './shop/catalog';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl('/');
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
      '/#historia',
      '/#productos',
      '/#origenes',
      '/tienda',
      '/#ubicacion',
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
    expect(history?.querySelector('img')?.getAttribute('src')).toBe('images/cafe/image.png');
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
    expect(links.length).toBe(9);
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
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toBe('Nuestra tienda');
    expect(compiled.querySelector('app-cafe-history')).toBeNull();
    TestBed.inject(CartService).add(SHOP_PRODUCTS[0], SHOP_PRODUCTS[0].variants[0]);
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

  it('should embed the Instagram reel and keep a safe fallback link', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('app-cafe-history a');
    const video = compiled.querySelector('app-cafe-history iframe');

    expect(video?.getAttribute('src')).toBe('https://www.instagram.com/reel/DZvGNztxa6K/embed/');
    expect(video?.getAttribute('title')).toContain('Café Nuestras Raíces');
    expect(video?.getAttribute('loading')).toBe('lazy');
    expect(video?.hasAttribute('allowfullscreen')).toBe(true);
    expect(link?.getAttribute('href')).toBe(
      'https://www.instagram.com/cafenuestrasraices/reel/DZvGNztxa6K/',
    );
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.textContent).toContain('puedes verlo en Instagram');
  });
});
