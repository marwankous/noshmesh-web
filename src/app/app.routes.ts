import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'available', pathMatch: 'full' },
      {
        path: 'available',
        loadComponent: () =>
          import('./features/available-orders/available-orders.component')
            .then(m => m.AvailableOrdersComponent),
      },
      {
        path: 'active',
        loadComponent: () =>
          import('./features/active-orders/active-orders.component')
            .then(m => m.ActiveOrdersComponent),
      },
      {
        path: 'my-bids',
        loadComponent: () =>
          import('./features/my-bids/my-bids.component')
            .then(m => m.MyBidsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
