import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin-topics',
    loadComponent: () =>
      import('./admin-topics/admin-topics.component').then(
        (m) => m.AdminTopicsComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: 'login' },
];
