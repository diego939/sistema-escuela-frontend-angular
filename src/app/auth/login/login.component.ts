import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  
  form = this.fb.group({
    email: [''],
    password: ['']
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit() {
  if (this.authService.isLogged()) {

    const menus = this.menuService.obtenerMenus();

    if (menus.length > 0) {
      this.router.navigate([menus[0].menuUrl]);
    }

  }
}
  
  login() {
  this.authService.login(this.form.value).subscribe(user => {

    this.authService.guardarUsuario(user);

    this.menuService.cargarMenus(user.idRol).subscribe(menus => {

      if (menus.length > 0) {
        const primeraRuta = menus[0].menuUrl;
        this.router.navigate([primeraRuta]);
      } else {
        this.router.navigate(['/login']);
      }

    });

  });
}
}