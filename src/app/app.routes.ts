import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { menuGuard } from './core/guards/menu.guard';

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
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [menuGuard],
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'cursos',
        canActivate: [menuGuard],
        loadComponent: () =>
          import('./features/cursos/pages/cursos/cursos.component')
            .then(m => m.CursosComponent)
      },
      {
        path: 'materias',
        canActivate: [menuGuard],
        loadComponent: () =>
          import('./features/materias/pages/materias/materias.component')
            .then(m => m.MateriasComponent)
      },
      {
        path: 'calificaciones',
        canActivate: [menuGuard],
        loadComponent: () =>
          import('./features/calificaciones/pages/calificaciones/calificaciones.component')
            .then(m => m.CalificacionesComponent)
      },
      {
        path: 'asistencia',
        canActivate: [menuGuard],
        loadComponent: () =>
          import('./features/asistencia/pages/asistencia/asistencia.component')
            .then(m => m.AsistenciaComponent)
      }
    ]
  },

  // ✅ default
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ✅ fallback (MUY recomendado)
  { path: '**', redirectTo: 'login' }
];
