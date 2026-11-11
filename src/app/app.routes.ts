import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Café Nuestras Raíces' },
  {
    path: 'tienda',
    loadComponent: () => import('./shop/shop').then((module) => module.ShopComponent),
    title: 'Tienda | Café Nuestras Raíces',
  },
  {
    path: 'pago/resultado',
    loadComponent: () =>
      import('./shop/payment-return/payment-return').then(
        (module) => module.PaymentReturnComponent,
      ),
    title: 'Resultado del pago | Café Nuestras Raíces',
  },
  // Shop counter: the pickup QR opens /retiro/<code> (needs the staff API key).
  {
    path: 'retiro',
    loadComponent: () =>
      import('./pickup-desk/pickup-desk').then((module) => module.PickupDeskComponent),
    title: 'Retiro en tienda | Café Nuestras Raíces',
  },
  {
    path: 'retiro/:code',
    loadComponent: () =>
      import('./pickup-desk/pickup-desk').then((module) => module.PickupDeskComponent),
    title: 'Retiro en tienda | Café Nuestras Raíces',
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./legal/privacy-policy').then((module) => module.PrivacyPolicyComponent),
    title: 'Política de tratamiento de datos | Café Nuestras Raíces',
  },
  {
    path: 'terminos',
    loadComponent: () => import('./legal/terms').then((module) => module.TermsComponent),
    title: 'Términos y condiciones | Café Nuestras Raíces',
  },
  { path: '**', redirectTo: '' },
];
