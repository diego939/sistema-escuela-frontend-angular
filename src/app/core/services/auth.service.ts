import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post<any>('http://localhost:5224/api/Usuario/login', data);
  }

  guardarUsuario(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  obtenerUsuario() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isLogged() {
    return !!this.obtenerUsuario();
  }

  logout() {
    localStorage.clear();
  }
}
