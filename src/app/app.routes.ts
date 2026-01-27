// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: 'dashboard',
//     loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
//   },
//   {
//     path: '',
//     redirectTo: 'dashboard',
//     pathMatch: 'full'
//   }
// ];
import { Routes } from '@angular/router';
import { ShellComponent } from './features/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./features/leaderboard/leaderboard.page').then((m) => m.LeaderboardPage),
      },
      {
        path: 'rttm',
        loadComponent: () => import('./features/rttm/rttm.page').then((m) => m.RttmPage),
      },
      {
        path: 'portfolio/:portfolioId',
        loadComponent: () =>
          import('./features/portfolio/portfolio.page/portfolio.page').then((m) => m.PortfolioPage),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
