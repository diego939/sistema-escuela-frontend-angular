import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { CursoService } from '../../../../core/services/curso.service';
import { Curso } from '../../../../core/models/curso.model';
import { CursoMateria } from '../../../../core/models/materia.model';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css'
})
export class CursosComponent implements OnInit {

  //Momentaneamente tres listas para los selectores:
  modalidades: string[] = ['Naturales', 'Economicas', 'Sociales'];
  divisiones: string[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  turnos: string[] = ['Mañana', 'Tarde', 'Noche'];

  cursos: Curso[] = [];

  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  hasNextPage = false;
  hasPreviousPage = false;

  search = '';

  // 🔥 alineado con backend
  sortBy = 'anio';
  sortDescending = false;

  modalCrearAbierto = false;
  modalEditarAbierto = false;
  modalMateriasAbierto = false;
  guardando = false;
  errorApi: string | null = null;
  materias: CursoMateria[] = [];
  cursoSeleccionado: Curso | null = null;
  cargandoMaterias = false;

  crearForm = this.fb.nonNullable.group({
    modulo: [1, [Validators.required, Validators.min(1)]],
    division: ['', Validators.required],
    modalidad: ['', Validators.required],
    turno: ['', Validators.required],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    cupoMaximo: [1, [Validators.required, Validators.min(1)]]
  });

  editarForm = this.fb.nonNullable.group({
    id: [0],
    modulo: [1, [Validators.required, Validators.min(1)]],
    division: ['', Validators.required],
    modalidad: ['', Validators.required],
    turno: ['', Validators.required],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    cupoMaximo: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private cursoService: CursoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  trackByCursoId(_: number, c: Curso): number {
    return c.id;
  }

  trackByMateriaId(_: number, m: CursoMateria): number {
    return m.id;
  }

  cargarCursos(): void {
    this.cursoService
      .getCursosPaginados(
        this.page,
        this.pageSize,
        this.search,
        this.sortBy,
        this.sortDescending
      )
      .subscribe(resp => {
        this.cursos = resp.data;
        this.totalRecords = resp.totalRecords;
        this.totalPages = resp.totalPages;

        // 🔥 FIX: calcular en frontend
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.totalPages;
      });
  }

  siguientePagina(): void {
    if (this.hasNextPage) {
      this.page++;
      this.cargarCursos();
    }
  }

  anteriorPagina(): void {
    if (this.hasPreviousPage) {
      this.page--;
      this.cargarCursos();
    }
  }

  buscar(): void {
    this.page = 1;
    this.cargarCursos();
  }

  ordenar(campo: string): void {
    if (this.sortBy === campo) {
      this.sortDescending = !this.sortDescending;
    } else {
      this.sortBy = campo;
      this.sortDescending = false;
    }
    this.cargarCursos();
  }

  abrirModalCrear(): void {
    this.errorApi = null;
    this.crearForm.reset({
      modulo: 1,
      division: '',
      modalidad: '',
      turno: '',
      anio: new Date().getFullYear(),
      cupoMaximo: 1
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

    this.cursoService.crear({
      modulo: v.modulo,
      division: v.division.trim(),
      modalidad: v.modalidad.trim(),
      turno: v.turno.trim(),
      anio: v.anio,
      cupoMaximo: v.cupoMaximo
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModalCrear();
        this.cargarCursos();
        this.toastSuccess('Curso creado correctamente');
      },
      error: err => {
        this.guardando = false;
        this.errorApi = this.mensajeErrorHttp(err);
      }
    });
  }

  private toastSuccess(mensaje: string) {
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

  abrirModalEditar(curso: Curso): void {
    this.errorApi = null;
    this.editarForm.patchValue({
      id: curso.id,
      modulo: curso.modulo,
      division: curso.division,
      modalidad: curso.modalidad,
      turno: curso.turno,
      anio: curso.anio,
      cupoMaximo: curso.cupoMaximo
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

    this.cursoService.editar({
      id: v.id,
      modulo: v.modulo,
      division: v.division.trim(),
      modalidad: v.modalidad.trim(),
      turno: v.turno.trim(),
      anio: v.anio,
      cupoMaximo: v.cupoMaximo
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModalEditar();
        this.cargarCursos();
        this.toastSuccess('Curso editado correctamente');
      },
      error: err => {
        this.guardando = false;
        this.errorApi = this.mensajeErrorHttp(err);
      }
    });
  }

  abrirModalMaterias(curso: Curso): void {
    this.cursoSeleccionado = curso;
    this.materias = [];
    this.cargandoMaterias = true;
    this.modalMateriasAbierto = true;
    this.cargarMateriasCurso(curso.id);
  }

  cerrarModalMaterias(): void {
    this.modalMateriasAbierto = false;
    this.cursoSeleccionado = null;
    this.materias = [];
    this.cargandoMaterias = false;
  }

  cargarMateriasCurso(idCurso: number): void {
    this.cursoService.getMateriasPorCurso(idCurso).subscribe({
      next: (materias) => {
        this.materias = materias;
        this.cargandoMaterias = false;
      },
      error: (err) => {
        this.cargandoMaterias = false;
        this.toastError('Error al cargar las materias');
        console.error(err);
      }
    });
  }

  private toastError(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'error',
      title: mensaje,
      showConfirmButton: false,
      timer: 2000
    });
  }
}