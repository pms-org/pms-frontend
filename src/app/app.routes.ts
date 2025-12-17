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

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then(m => m.DashboardPage),
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./features/leaderboard/leaderboard.page').then(m => m.LeaderboardPage),
      },
      {
        path: 'rttm',
        loadComponent: () =>
          import('./features/rttm/rttm.page').then(m => m.RttmPage),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
