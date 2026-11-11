import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactBarComponent } from '../contact-bar/contact-bar';
import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY } from './legal';

/** Terms of sale for the online shop (Ley 1480 de 2011, Estatuto del Consumidor). */
@Component({
  selector: 'app-terms',
  imports: [ContactBarComponent, RouterLink],
  templateUrl: './terms.html',
  styleUrl: './legal-page.css',
})
export class TermsComponent {
  readonly entity = LEGAL_ENTITY;
  readonly effectiveDate = LEGAL_EFFECTIVE_DATE;
}
