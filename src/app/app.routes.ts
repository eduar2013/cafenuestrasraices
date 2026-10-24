import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Café Nuestras Raíces' },
  {
    path: 'tienda',
    loadComponent: () => import('./shop/shop').then((module) => module.ShopComponent),
    title: 'Tienda | Café Nuestras Raíces',
  },
  { path: '**', redirectTo: '' },
];
