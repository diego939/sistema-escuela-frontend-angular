import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post<any>(`${this.baseUrl}/api/Usuario/login`, data);
  }

  guardarUsuario(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  }

  obtenerUsuario() {
    if (isPlatformBrowser(this.platformId)) {
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isLogged(): boolean {
    return !!this.obtenerUsuario();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }
  }
}
