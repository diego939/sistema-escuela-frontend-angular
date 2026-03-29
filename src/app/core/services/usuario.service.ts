import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioPaginadoResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsuariosPaginados(page: number, pageSize: number, search: string, sortBy: string, sortDescending: boolean): Observable<UsuarioPaginadoResponse> {
    const params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('sortDescending', sortDescending.toString());

    const response = this.http.get<UsuarioPaginadoResponse>(`${this.baseUrl}/api/Usuario/lista-paginado`, { params });
    console.log('Respuesta del servicio:', response);
    return response;
  }
}
