import { Component } from '@angular/core';
import { MenuService } from '../../core/services/menu.service';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor,CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
  })
export class SidebarComponent {
menus: any[] = [];

constructor(private menuService: MenuService) {}

ngOnInit() {
  this.menuService.menus$.subscribe(m => this.menus = m);
  this.menuService.cargarDesdeStorage();
}

logout() {
  AuthService.prototype.logout();
}
}
