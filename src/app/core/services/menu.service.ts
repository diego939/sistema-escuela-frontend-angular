import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuService {

  private baseUrl = environment.apiUrl;
  private menusSubject = new BehaviorSubject<any[]>([]);
  menus$ = this.menusSubject.asObservable();

  constructor(private http: HttpClient) {}

  cargarMenus(idRol: number) {
  return this.http.get<any[]>(`${this.baseUrl}/api/Menu/rol/${idRol}`)
    .pipe(
      tap(menus => {
        this.menusSubject.next(menus);
        sessionStorage.setItem('menus', JSON.stringify(menus));
      })
    );
  }

  obtenerMenus(): any[] {
    const data = sessionStorage.getItem('menus');
    return data ? JSON.parse(data) : [];
  }

  cargarDesdeStorage() {
  if (typeof sessionStorage !== 'undefined') {
    const data = sessionStorage.getItem('menus');
    if (data) {
      this.menusSubject.next(JSON.parse(data));
    }
  }
}
}
