import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];

  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  hasNextPage = false;
  hasPreviousPage = false;

  search = '';
  sortBy = 'id';
  sortDescending = false;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
  this.usuarioService
    .getUsuariosPaginados(
      this.page,
      this.pageSize,
      this.search,
      this.sortBy,
      this.sortDescending
    )
    .subscribe(resp => {
      this.usuarios = resp.data;
      this.totalRecords = resp.totalRecords;
      this.totalPages = resp.totalPages;
      this.hasNextPage = resp.hasNextPage;
      this.hasPreviousPage = resp.hasPreviousPage;
    });
}

  siguientePagina() {
    if (this.hasNextPage) {
      this.page++;
      this.cargarUsuarios();
    }
  }

  anteriorPagina() {
    if (this.hasPreviousPage) {
      this.page--;
      this.cargarUsuarios();
    }
  }

  buscar() {
  this.page = 1; // reset página
  this.cargarUsuarios();
}

ordenar(campo: string) {
  if (this.sortBy === campo) {
    this.sortDescending = !this.sortDescending;
  } else {
    this.sortBy = campo;
    this.sortDescending = false;
  }

  this.cargarUsuarios();
}
}

