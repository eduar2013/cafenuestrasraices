import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ContactBarComponent } from '../contact-bar/contact-bar';
import { CafeHistoryComponent } from '../cafe-history/cafe-history';
import { CoffeeOriginsComponent } from '../coffee-origins/coffee-origins';
import { CarouselComponent } from '../carousel/carousel';
import { CatalogService } from '../shop/catalog';

/** Opening hours, every day, in Colombia time. */
const OPENS_AT = 8;
const CLOSES_AT = 21;

/** Brewing methods offered at the bar (confirmed by the shop). */
export const BAR_METHODS: readonly { readonly name: string; readonly detail: string }[] = [
  { name: 'Espresso', detail: 'Y bebidas con leche: americano, capuchino, latte.' },
  { name: 'V60 y Chemex', detail: 'Filtrados que dejan ver las notas de cada origen.' },
  { name: 'Prensa francesa', detail: 'Inmersión: una taza de más cuerpo.' },
  { name: 'AeroPress, sifón y moka', detail: 'Otras formas de preparar el mismo café.' },
];

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    NavbarComponent,
    ContactBarComponent,
    CafeHistoryComponent,
    CoffeeOriginsComponent,
    CarouselComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnDestroy {
  readonly catalog = inject(CatalogService);
  readonly methods = BAR_METHODS;
  /** Up to four available coffees for "Llévalo". */
  readonly coffees = computed(() =>
    this.catalog
      .products()
      .filter((product) => product.isCoffee && product.available)
      .slice(0, 4),
  );

  private readonly now = signal(new Date());
  private readonly clock = setInterval(() => this.now.set(new Date()), 60_000);
  /** Open-now status from the shop's hours, read in Bogotá time. */
  readonly isOpen = computed(() => {
    const hour = Number(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hourCycle: 'h23',
        timeZone: 'America/Bogota',
      }).format(this.now()),
    );
    return hour >= OPENS_AT && hour < CLOSES_AT;
  });

  ngOnDestroy(): void {
    clearInterval(this.clock);
  }
}
