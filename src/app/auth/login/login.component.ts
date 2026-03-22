import { Component } from '@angular/core';
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
export class LoginComponent {
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

  login() {
    this.authService.login(this.form.value).subscribe(user => {

      this.authService.guardarUsuario(user);

      this.menuService.cargarMenus(user.idRol);

      this.router.navigate(['/pages/dashboard']);
    });
  }
}