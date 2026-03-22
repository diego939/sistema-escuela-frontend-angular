import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {

  private menusSubject = new BehaviorSubject<any[]>([]);
  menus$ = this.menusSubject.asObservable();

  constructor(private http: HttpClient) {}

  cargarMenus(idRol: number) {
    this.http.get<any[]>(`http://localhost:5224/api/Menu/rol/${idRol}`)
      .subscribe(menus => {
        this.menusSubject.next(menus);
        localStorage.setItem('menus', JSON.stringify(menus));
      });
  }

  cargarDesdeStorage() {
    const data = localStorage.getItem('menus');
    if (data) this.menusSubject.next(JSON.parse(data));
  }
}
