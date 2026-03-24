import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  menus: any[] = [];
  isOpen = false; // CONTROL DEL DRAWER

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.menuService.menus$.subscribe(m => this.menus = m);
    this.menuService.cargarDesdeStorage();
  }

  // NUEVOS MÉTODOS
  toggleDrawer() {
    this.isOpen = !this.isOpen;
  }

  closeDrawer() {
    this.isOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeDrawer(); // importante
    this.router.navigate(['/login']);
  }
}
