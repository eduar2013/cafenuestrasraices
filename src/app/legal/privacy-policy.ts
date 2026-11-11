import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactBarComponent } from '../contact-bar/contact-bar';
import { LEGAL_EFFECTIVE_DATE, LEGAL_ENTITY } from './legal';

/** Personal data policy required by Ley 1581 de 2012 and Decreto 1377 de 2013. */
@Component({
  selector: 'app-privacy-policy',
  imports: [ContactBarComponent, RouterLink],
  templateUrl: './privacy-policy.html',
  styleUrl: './legal-page.css',
})
export class PrivacyPolicyComponent {
  readonly entity = LEGAL_ENTITY;
  readonly effectiveDate = LEGAL_EFFECTIVE_DATE;
}
