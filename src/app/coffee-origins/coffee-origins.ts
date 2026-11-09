import {
  Component,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../shop/catalog';
import { CoffeeOrigin, normalize, toCoffeeOrigins } from './origins';

const MAP_URL = 'images/origins/colombia.svg';

@Component({
  selector: 'app-coffee-origins',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './coffee-origins.html',
  styleUrl: './coffee-origins.css',
})
export class CoffeeOriginsComponent {
  readonly catalog = inject(CatalogService);
  readonly origins = computed(() => toCoffeeOrigins(this.catalog.apiProducts()));

  private readonly selectedOriginId = signal<string | undefined>(undefined);
  private readonly selectedCoffeeId = signal<string | undefined>(undefined);
  /** The map drawn inline, so each department can be painted. Until it loads, the image is used. */
  readonly mapSvg = signal<SafeHtml | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly sanitizer = inject(DomSanitizer);

  // Fall back to the first origin and coffee so the detail is filled as soon as data arrives.
  readonly selectedOrigin = computed(
    () =>
      this.origins().find((origin) => origin.id === this.selectedOriginId()) ?? this.origins()[0],
  );
  readonly selectedCoffee = computed(() => {
    const coffees = this.selectedOrigin()?.coffees;
    return coffees?.find((coffee) => coffee.id === this.selectedCoffeeId()) ?? coffees?.[0];
  });
  /** The map leans toward the selected origin: its pin becomes the zoom's centre. */
  readonly zoomOrigin = computed(() => {
    const origin = this.selectedOrigin();
    return origin ? `${this.mapLeft(origin)}% ${this.mapTop(origin)}%` : '50% 50%';
  });

  constructor() {
    afterNextRender(() => void this.loadMap());
    // Paint coffee departments and the selected one on the inline map.
    afterRenderEffect(() => {
      const withCoffee = new Set(this.origins().map((origin) => origin.department));
      const selected = this.selectedOrigin()?.department;
      if (!this.mapSvg()) {
        return;
      }
      for (const path of this.host.querySelectorAll<SVGPathElement>('.map-svg path')) {
        const key = normalize(path.dataset['department'] ?? '');
        path.classList.toggle('has-coffee', withCoffee.has(key));
        path.classList.toggle('is-selected', key === selected);
      }
    });
  }

  selectOrigin(origin: CoffeeOrigin): void {
    this.selectedOriginId.set(origin.id);
    this.selectedCoffeeId.set(undefined);
  }

  selectCoffee(id: string): void {
    this.selectedCoffeeId.set(id);
  }

  mapLeft(origin: CoffeeOrigin): number {
    return (((origin.longitude + 80) * 26 + 20) / 400) * 100;
  }

  mapTop(origin: CoffeeOrigin): number {
    return (((13.5 - origin.latitude) * 26 + 20) / 520) * 100;
  }

  /** The SVG is a project asset, so it is trusted as markup. Any failure keeps the image. */
  private async loadMap(): Promise<void> {
    try {
      const response = await fetch(MAP_URL);
      if (!response.ok) {
        return;
      }
      const markup = (await response.text())
        .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, '')
        .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
      this.mapSvg.set(this.sanitizer.bypassSecurityTrustHtml(markup));
    } catch {
      // Keep the <img> map.
    }
  }
}
