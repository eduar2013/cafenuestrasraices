import { Component, DestroyRef, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SideNavComponent } from '../side-nav/side-nav';

@Component({
  selector: 'app-contact-bar',
  standalone: true,
  imports: [RouterLink, SideNavComponent],
  templateUrl: './contact-bar.html',
  styleUrl: './contact-bar.css',
})
export class ContactBarComponent {
  /** Hidden in the shop itself. */
  readonly showShopLink = input(true);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const root = inject(DOCUMENT).documentElement;
    const destroyRef = inject(DestroyRef);
    // Other sticky bars (like the shop toolbar) sit below this one using --contact-bar-height.
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver(() =>
        root.style.setProperty('--contact-bar-height', `${host.offsetHeight}px`),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
