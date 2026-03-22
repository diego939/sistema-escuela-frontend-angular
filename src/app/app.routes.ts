import { Routes } from '@angular/router';

export const routes: Routes = [

  // ✅ LOGIN afuera
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // 🔐 APP con layout
  {
    path: 'pages',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./features/cursos/pages/cursos/cursos.component')
            .then(m => m.CursosComponent)
      },
      {
        path: 'materias',
        loadComponent: () =>
          import('./features/materias/pages/materias/materias.component')
            .then(m => m.MateriasComponent)
      }
    ]
  },

  // ✅ default
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ✅ fallback (MUY recomendado)
  { path: '**', redirectTo: 'login' }
];
