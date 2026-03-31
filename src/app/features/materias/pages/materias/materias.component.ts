import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { MateriaService } from '../../../../core/services/materia.service';
import { Materia } from '../../../../core/models/materia.model';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './materias.component.html',
  styleUrl: './materias.component.css'
})
export class MateriasComponent implements OnInit {

  materias: Materia[] = [];

  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  hasNextPage = false;
  hasPreviousPage = false;

  search = '';

  sortBy = 'descripcion';
  sortDescending = false;

  modalCrearAbierto = false;
  modalEditarAbierto = false;
  guardando = false;
  errorApi: string | null = null;

  crearForm = this.fb.nonNullable.group({
    descripcion: ['', [Validators.required, Validators.minLength(1)]]
  });

  editarForm = this.fb.nonNullable.group({
    id: [0],
    descripcion: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor(
    private materiaService: MateriaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarMaterias();
  }

  trackByMateriaId(_: number, m: Materia): number {
    return m.id;
  }

  cargarMaterias(): void {
    this.materiaService
      .getMateriasPaginados(
        this.page,
        this.pageSize,
        this.search,
        this.sortBy,
        this.sortDescending
      )
      .subscribe(resp => {
        this.materias = resp.data;
        this.totalRecords = resp.totalRecords;
        this.totalPages = resp.totalPages;

        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.totalPages;
      });
  }

  siguientePagina(): void {
    if (this.hasNextPage) {
      this.page++;
      this.cargarMaterias();
    }
  }

  anteriorPagina(): void {
    if (this.hasPreviousPage) {
      this.page--;
      this.cargarMaterias();
    }
  }

  buscar(): void {
    this.page = 1;
    this.cargarMaterias();
  }

  ordenar(campo: string): void {
    if (this.sortBy === campo) {
      this.sortDescending = !this.sortDescending;
    } else {
      this.sortBy = campo;
      this.sortDescending = false;
    }
    this.cargarMaterias();
  }

  abrirModalCrear(): void {
    this.errorApi = null;
    this.crearForm.reset({
      descripcion: ''
    });
    this.modalCrearAbierto = true;
  }

  cerrarModalCrear(): void {
    this.modalCrearAbierto = false;
    this.errorApi = null;
  }

  guardarCrear(): void {
    if (this.guardando) return;

    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      this.errorApi = 'Complete todos los campos correctamente.';
      return;
    }

    const v = this.crearForm.getRawValue();

    this.guardando = true;
    this.errorApi = null;

    this.materiaService.crear({
      descripcion: v.descripcion.trim()
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModalCrear();
        this.cargarMaterias();
        this.toastSuccess('Materia creada correctamente');
      },
      error: err => {
        this.guardando = false;
        this.errorApi = this.mensajeErrorHttp(err);
      }
    });
  }

  private toastSuccess(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'success',
      title: mensaje,
      showConfirmButton: false,
      timer: 2000
    });
  }

  private mensajeErrorHttp(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string') {
        return err.error;
      }
      return err.error?.message || 'Error en la solicitud';
    }
    return 'Ocurrió un error';
  }

  abrirModalEditar(materia: Materia): void {
    this.errorApi = null;
    this.editarForm.patchValue({
      id: materia.id,
      descripcion: materia.descripcion
    });
    this.modalEditarAbierto = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.errorApi = null;
  }

  guardarEditar(): void {
    if (this.guardando) return;

    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      this.errorApi = 'Complete todos los campos correctamente.';
      return;
    }

    const v = this.editarForm.getRawValue();

    this.guardando = true;
    this.errorApi = null;

    this.materiaService.editar({
      id: v.id,
      descripcion: v.descripcion.trim()
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModalEditar();
        this.cargarMaterias();
        this.toastSuccess('Materia editada correctamente');
      },
      error: err => {
        this.guardando = false;
        this.errorApi = this.mensajeErrorHttp(err);
      }
    });
  }
}
