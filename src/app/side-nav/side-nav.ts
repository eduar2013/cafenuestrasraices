import { Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Section menu: a button in the contact bar that opens a dropdown list of links. */
@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
  host: { '(document:click)': 'closeIfOutside($event)' },
})
export class SideNavComponent {
  readonly isOpen = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  close(): void {
    this.isOpen.set(false);
  }

  /** Clicking anywhere else on the page closes the dropdown. */
  closeIfOutside(event: Event): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
