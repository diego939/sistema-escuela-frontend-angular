import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MenuService } from '../services/menu.service';

export const menuGuard: CanActivateFn = (route, state) => {

  const menuService = inject(MenuService);
  const router = inject(Router);

  const menus = menuService.obtenerMenus();
  const url = state.url; // ej: /pages/dashboard

  const tieneAcceso = menus.some(m => url.includes(m.menuUrl));

  if (tieneAcceso) {
    return true;
  }

  return router.createUrlTree(['/login']);
};