import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MenuService {

  private menusSubject = new BehaviorSubject<any[]>([]);
  menus$ = this.menusSubject.asObservable();

  constructor(private http: HttpClient) {}

  cargarMenus(idRol: number) {
  return this.http.get<any[]>(`http://localhost:5224/api/Menu/rol/${idRol}`)
    .pipe(
      tap(menus => {
        this.menusSubject.next(menus);
        localStorage.setItem('menus', JSON.stringify(menus));
      })
    );
  }

  obtenerMenus(): any[] {
    const data = localStorage.getItem('menus');
    return data ? JSON.parse(data) : [];
  }

  cargarDesdeStorage() {
  if (typeof localStorage !== 'undefined') {
    const data = localStorage.getItem('menus');
    if (data) {
      this.menusSubject.next(JSON.parse(data));
    }
  }
}
}
