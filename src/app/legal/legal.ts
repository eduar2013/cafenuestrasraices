/**
 * Business details and document versions shared by the privacy policy, the terms and the
 * checkout consent. Fields in brackets are still to be filled in by the business.
 */
export const LEGAL_ENTITY = {
  brand: 'Café Nuestras Raíces',
  /** Legal name as registered (persona natural or sociedad). */
  legalName: '[Razón social o nombre del titular]',
  taxId: '[NIT o cédula]',
  address: 'Calle 72 Sur #46 A 35, Sabaneta, Antioquia, Colombia',
  email: '[correo de contacto]',
  whatsapp: '320 780 3402',
  whatsappUrl: 'https://wa.me/573207803402',
} as const;

/**
 * Version of each document, as the date it took effect. The checkout sends both with the
 * buyer's consent, so the API can record which text they accepted. Change the date whenever
 * a text changes in substance.
 */
export const PRIVACY_POLICY_VERSION = '2026-11-10';
export const TERMS_VERSION = '2026-11-10';

/** Human-readable effective date shown on both pages. */
export const LEGAL_EFFECTIVE_DATE = '10 de noviembre de 2026';
