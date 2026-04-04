import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ProfesorService } from '../../../../core/services/profesor.service';
import { PreceptorService } from '../../../../core/services/preceptor.service';
import { CursoService } from '../../../../core/services/curso.service';
import { Rol, Usuario } from '../../../../core/models/usuario.model';
import { Curso } from '../../../../core/models/curso.model';
import { CursoMateria } from '../../../../core/models/materia.model';
import {
  Profesor,
  MateriaProfesor,
  CursoProfesor
} from '../../../../core/models/profesor.model';
import { Preceptor, PreceptorCurso } from '../../../../core/models/preceptor.model';
import Swal from 'sweetalert2';

export type TabUsuarios = 'usuarios' | 'profesores' | 'preceptores';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  tabActivo: TabUsuarios = 'usuarios';

  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  hasNextPage = false;
  hasPreviousPage = false;

  search = '';
  sortBy = 'id';
  sortDescending = false;

  modalCrearAbierto = false;
  modalEditarAbierto = false;
  modalConfirmAbierto = false;

  guardando = false;
  errorApi: string | null = null;

  usuarioConfirmacion: Usuario | null = null;
  accionConfirmacion: 'activar' | 'desactivar' | null = null;

  /** --- Profesores (RF11–RF13) --- */
  profesores: Profesor[] = [];
  profPage = 1;
  profPageSize = 10;
  profTotalRecords = 0;
  profTotalPages = 0;
  profHasNextPage = false;
  profHasPreviousPage = false;
  profSearch = '';
  profSortBy = 'nombres';
  profSortDescending = false;

  modalProfAsignarAbierto = false;
  modalProfMateriasAbierto = false;
  modalProfCursosAbierto = false;
  profesorAccion: Profesor | null = null;
  guardandoProfAsignar = false;
  errorProfModal: string | null = null;
  cursosSelect: Curso[] = [];
  cargandoCursosSelect = false;
  materiasCursoSelect: CursoMateria[] = [];
  profAsignarCursoId: number | null = null;
  profAsignarCursoMateriaId: number | null = null;
  cargandoProfMaterias = false;
  cargandoProfCursos = false;
  materiasProfesorLista: MateriaProfesor[] = [];
  cursosProfesorLista: CursoProfesor[] = [];

  /** --- Preceptores (RF14–RF15) --- */
  preceptores: Preceptor[] = [];
  prepPage = 1;
  prepPageSize = 10;
  prepTotalRecords = 0;
  prepTotalPages = 0;
  prepHasNextPage = false;
  prepHasPreviousPage = false;
  prepSearch = '';
  prepSortBy = 'nombres';
  prepSortDescending = false;

  modalPrepAsignarAbierto = false;
  modalPrepCursosAbierto = false;
  preceptorAccion: Preceptor | null = null;
  guardandoPrepAsignar = false;
  errorPrepModal: string | null = null;
  cursosSelectPrep: Curso[] = [];
  cargandoCursosSelectPrep = false;
  prepAsignarCursoId: number | null = null;
  cargandoPrepCursos = false;
  cursosPreceptorLista: PreceptorCurso[] = [];

  crearForm = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    telefono: [''],
    dni: ['', Validators.required],
    idRol: [null as number | null, Validators.required]
  });

  editarForm = this.fb.nonNullable.group({
    id: [0],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    dni: ['', Validators.required],
    idRol: [null as number | null, Validators.required],
    urlImagen: ['']
  });

  constructor(
    private usuarioService: UsuarioService,
    private profesorService: ProfesorService,
    private preceptorService: PreceptorService,
    private cursoService: CursoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  trackByUsuarioId(_: number, u: Usuario): number {
    return u.id;
  }

  trackByProfesorId(_: number, p: Profesor): number {
    return p.id;
  }

  trackByPreceptorId(_: number, p: Preceptor): number {
    return p.id;
  }

  cambiarTab(tab: TabUsuarios): void {
    this.tabActivo = tab;
    if (tab === 'usuarios') {
      this.cargarUsuarios();
    } else if (tab === 'profesores') {
      this.cargarProfesores();
    } else {
      this.cargarPreceptores();
    }
  }

  etiquetaCurso(c: Curso): string {
    return `${c.anio} · ${c.modulo}° ${c.division} · ${c.turno}`;
  }

  /** Profesores */
  cargarProfesores(): void {
    this.profesorService
      .getProfesoresPaginados(
        this.profPage,
        this.profPageSize,
        this.profSearch,
        this.profSortBy,
        this.profSortDescending
      )
      .subscribe(resp => {
        this.profesores = resp.data;
        this.profTotalRecords = resp.totalRecords;
        this.profTotalPages = resp.totalPages;
        this.profHasPreviousPage =
          resp.hasPreviousPage ?? this.profPage > 1;
        this.profHasNextPage =
          resp.hasNextPage ?? this.profPage < this.profTotalPages;
      });
  }

  siguientePaginaProf(): void {
    if (this.profHasNextPage) {
      this.profPage++;
      this.cargarProfesores();
    }
  }

  anteriorPaginaProf(): void {
    if (this.profHasPreviousPage) {
      this.profPage--;
      this.cargarProfesores();
    }
  }

  buscarProf(): void {
    this.profPage = 1;
    this.cargarProfesores();
  }

  ordenarProf(campo: string): void {
    if (this.profSortBy === campo) {
      this.profSortDescending = !this.profSortDescending;
    } else {
      this.profSortBy = campo;
      this.profSortDescending = false;
    }
    this.cargarProfesores();
  }

  abrirModalProfAsignar(p: Profesor): void {
    this.profesorAccion = p;
    this.errorProfModal = null;
    this.profAsignarCursoId = null;
    this.profAsignarCursoMateriaId = null;
    this.materiasCursoSelect = [];
    this.modalProfAsignarAbierto = true;
    this.cargandoCursosSelect = true;
    this.cursoService.getCursosPaginados(1, 500, '', 'anio', false).subscribe({
      next: r => {
        this.cursosSelect = r.data;
        this.cargandoCursosSelect = false;
      },
      error: err => {
        this.cargandoCursosSelect = false;
        this.errorProfModal = this.mensajeErrorHttp(err);
      }
    });
  }

  cerrarModalProfAsignar(): void {
    this.modalProfAsignarAbierto = false;
    this.profesorAccion = null;
    this.errorProfModal = null;
    this.cursosSelect = [];
    this.materiasCursoSelect = [];
    this.profAsignarCursoId = null;
    this.profAsignarCursoMateriaId = null;
    this.guardandoProfAsignar = false;
  }

  onProfCursoSeleccionado(idCurso: number | null): void {
    this.profAsignarCursoMateriaId = null;
    this.materiasCursoSelect = [];
    if (idCurso == null || !Number.isFinite(idCurso)) {
      return;
    }
    this.cursoService.getMateriasPorCurso(idCurso).subscribe({
      next: m => {
        this.materiasCursoSelect = m;
      },
      error: err => {
        this.errorProfModal = this.mensajeErrorHttp(err);
      }
    });
  }

  guardarProfAsignar(): void {
    const prof = this.profesorAccion;
    const idCm = this.profAsignarCursoMateriaId;
    if (!prof || idCm == null || this.guardandoProfAsignar) {
      this.errorProfModal =
        'Seleccione un curso y una materia (relación curso-materia).';
      return;
    }
    this.guardandoProfAsignar = true;
    this.errorProfModal = null;
    this.profesorService
      .asignar({ idProfesor: prof.id, idCursoMateria: idCm })
      .subscribe({
        next: () => {
          this.guardandoProfAsignar = false;
          this.cerrarModalProfAsignar();
          this.toastSuccess('Profesor asignado a la materia correctamente');
        },
        error: err => {
          this.guardandoProfAsignar = false;
          this.errorProfModal = this.mensajeErrorHttp(err);
        }
      });
  }

  abrirModalProfMaterias(p: Profesor): void {
    this.profesorAccion = p;
    this.materiasProfesorLista = [];
    this.cargandoProfMaterias = true;
    this.modalProfMateriasAbierto = true;
    this.profesorService.getMateriasDelProfesor(p.id).subscribe({
      next: list => {
        this.materiasProfesorLista = list;
        this.cargandoProfMaterias = false;
      },
      error: err => {
        this.cargandoProfMaterias = false;
        this.toastError(this.mensajeErrorHttp(err));
      }
    });
  }

  cerrarModalProfMaterias(): void {
    this.modalProfMateriasAbierto = false;
    this.profesorAccion = null;
    this.materiasProfesorLista = [];
  }

  abrirModalProfCursos(p: Profesor): void {
    this.profesorAccion = p;
    this.cursosProfesorLista = [];
    this.cargandoProfCursos = true;
    this.modalProfCursosAbierto = true;
    this.profesorService.getCursosDelProfesor(p.id).subscribe({
      next: list => {
        this.cursosProfesorLista = list;
        this.cargandoProfCursos = false;
      },
      error: err => {
        this.cargandoProfCursos = false;
        this.toastError(this.mensajeErrorHttp(err));
      }
    });
  }

  cerrarModalProfCursos(): void {
    this.modalProfCursosAbierto = false;
    this.profesorAccion = null;
    this.cursosProfesorLista = [];
  }

  /** Preceptores */
  cargarPreceptores(): void {
    this.preceptorService
      .getPreceptoresPaginados(
        this.prepPage,
        this.prepPageSize,
        this.prepSearch,
        this.prepSortBy,
        this.prepSortDescending
      )
      .subscribe(resp => {
        this.preceptores = resp.data;
        this.prepTotalRecords = resp.totalRecords;
        this.prepTotalPages = resp.totalPages;
        this.prepHasPreviousPage =
          resp.hasPreviousPage ?? this.prepPage > 1;
        this.prepHasNextPage =
          resp.hasNextPage ?? this.prepPage < this.prepTotalPages;
      });
  }

  siguientePaginaPrep(): void {
    if (this.prepHasNextPage) {
      this.prepPage++;
      this.cargarPreceptores();
    }
  }

  anteriorPaginaPrep(): void {
    if (this.prepHasPreviousPage) {
      this.prepPage--;
      this.cargarPreceptores();
    }
  }

  buscarPrep(): void {
    this.prepPage = 1;
    this.cargarPreceptores();
  }

  ordenarPrep(campo: string): void {
    if (this.prepSortBy === campo) {
      this.prepSortDescending = !this.prepSortDescending;
    } else {
      this.prepSortBy = campo;
      this.prepSortDescending = false;
    }
    this.cargarPreceptores();
  }

  abrirModalPrepAsignar(p: Preceptor): void {
    this.preceptorAccion = p;
    this.errorPrepModal = null;
    this.prepAsignarCursoId = null;
    this.modalPrepAsignarAbierto = true;
    this.cargandoCursosSelectPrep = true;
    this.cursoService.getCursosPaginados(1, 500, '', 'anio', false).subscribe({
      next: r => {
        this.cursosSelectPrep = r.data;
        this.cargandoCursosSelectPrep = false;
      },
      error: err => {
        this.cargandoCursosSelectPrep = false;
        this.errorPrepModal = this.mensajeErrorHttp(err);
      }
    });
  }

  cerrarModalPrepAsignar(): void {
    this.modalPrepAsignarAbierto = false;
    this.preceptorAccion = null;
    this.errorPrepModal = null;
    this.cursosSelectPrep = [];
    this.prepAsignarCursoId = null;
    this.guardandoPrepAsignar = false;
  }

  guardarPrepAsignar(): void {
    const prep = this.preceptorAccion;
    const idCurso = this.prepAsignarCursoId;
    if (!prep || idCurso == null || this.guardandoPrepAsignar) {
      this.errorPrepModal = 'Seleccione un curso.';
      return;
    }
    this.guardandoPrepAsignar = true;
    this.errorPrepModal = null;
    this.preceptorService
      .asignar({ idPreceptor: prep.id, idCurso })
      .subscribe({
        next: () => {
          this.guardandoPrepAsignar = false;
          this.cerrarModalPrepAsignar();
          this.toastSuccess('Preceptor asignado al curso correctamente');
        },
        error: err => {
          this.guardandoPrepAsignar = false;
          this.errorPrepModal = this.mensajeErrorHttp(err);
        }
      });
  }

  abrirModalPrepCursos(p: Preceptor): void {
    this.preceptorAccion = p;
    this.cursosPreceptorLista = [];
    this.cargandoPrepCursos = true;
    this.modalPrepCursosAbierto = true;
    this.preceptorService.getCursosDelPreceptor(p.id).subscribe({
      next: list => {
        this.cursosPreceptorLista = list;
        this.cargandoPrepCursos = false;
      },
      error: err => {
        this.cargandoPrepCursos = false;
        this.toastError(this.mensajeErrorHttp(err));
      }
    });
  }

  cerrarModalPrepCursos(): void {
    this.modalPrepCursosAbierto = false;
    this.preceptorAccion = null;
    this.cursosPreceptorLista = [];
  }

  private toastError(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'top',
      icon: 'error',
      title: mensaje,
      showConfirmButton: false,
      timer: 2500
    });
  }

  private cargarRoles(): void {
    this.usuarioService.listarRoles().subscribe({
      next: roles => {
        this.roles = roles;
      },
      error: () => {
        this.roles = [];
      }
    });
  }

  cargarUsuarios(): void {
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

  siguientePagina(): void {
    if (this.hasNextPage) {
      this.page++;
      this.cargarUsuarios();
    }
  }

  anteriorPagina(): void {
    if (this.hasPreviousPage) {
      this.page--;
      this.cargarUsuarios();
    }
  }

  buscar(): void {
    this.page = 1;
    this.cargarUsuarios();
  }

  ordenar(campo: string): void {
    if (this.sortBy === campo) {
      this.sortDescending = !this.sortDescending;
    } else {
      this.sortBy = campo;
      this.sortDescending = false;
    }
    this.cargarUsuarios();
  }

  private toastSuccess(mensaje: string) {
  Swal.fire({
    toast: true,
    position: 'top',
    icon: 'success',
    title: mensaje,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
}

  abrirModalCrear(): void {
    this.errorApi = null;
    this.aplicarValoresInicialesCrear();
    this.modalCrearAbierto = true;
    if (this.roles.length === 0) {
      this.usuarioService.listarRoles().subscribe({
        next: roles => {
          this.roles = roles;
          this.aplicarValoresInicialesCrear();
        }
      });
    }
  }

  private aplicarValoresInicialesCrear(): void {
    this.crearForm.reset({
      nombres: '',
      apellidos: '',
      email: '',
      password: '',
      telefono: '',
      dni: '',
      idRol: this.roles[0]?.id ?? null
    });
  }

  cerrarModalCrear(): void {
    this.modalCrearAbierto = false;
    this.errorApi = null;
  }

  guardarCrear(): void {
    if (this.guardando) {
      return;
    }
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      this.errorApi =
        'Complete los campos obligatorios: nombres, apellidos, email válido, contraseña (mín. 6 caracteres), DNI y rol.';
      return;
    }
    const v = this.crearForm.getRawValue();
    const idRol = Number(v.idRol);
    if (!Number.isFinite(idRol)) {
      this.errorApi = 'Seleccione un rol válido.';
      return;
    }
    this.guardando = true;
    this.errorApi = null;
    this.usuarioService
      .crear({
        nombres: v.nombres.trim(),
        apellidos: v.apellidos.trim(),
        email: v.email.trim(),
        password: v.password,
        telefono: (v.telefono ?? '').trim(),
        dni: v.dni.trim(),
        idRol
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModalCrear();
          this.cargarUsuarios();
          this.toastSuccess('Usuario creado correctamente');
        },
        error: err => {
          this.guardando = false;
          this.errorApi = this.mensajeErrorHttp(err);
        }
      });
  }

  abrirModalEditar(user: Usuario): void {
    this.errorApi = null;
    this.editarForm.patchValue({
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      telefono: user.telefono ?? '',
      dni: user.dni,
      idRol: user.idRol ?? this.roles[0]?.id ?? null,
      urlImagen: user.urlImagen ?? ''
    });
    this.modalEditarAbierto = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.errorApi = null;
  }

  guardarEditar(): void {
    if (this.editarForm.invalid || this.guardando) {
      this.editarForm.markAllAsTouched();
      return;
    }
    const v = this.editarForm.getRawValue();
    this.guardando = true;
    this.errorApi = null;
    this.usuarioService
      .editar({
        id: v.id,
        nombres: v.nombres,
        apellidos: v.apellidos,
        email: v.email,
        telefono: v.telefono ?? '',
        dni: v.dni,
        idRol: Number(v.idRol),
        urlImagen: v.urlImagen ?? ''
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModalEditar();
          this.cargarUsuarios();
          this.toastSuccess('Usuario editado correctamente');
        },
        error: err => {
          this.guardando = false;
          this.errorApi = this.mensajeErrorHttp(err);
        }
      });
  }

  /** Activo = sin fecha de eliminación (ni cadena vacía). */
  private usuarioEstaActivo(user: Usuario): boolean {
    const f = user.fechaEliminacion;
    if (f == null) {
      return true;
    }
    if (typeof f === 'string') {
      return f.trim().length === 0;
    }
    return false;
  }

  /** Mostrar si está inactivo (tiene fecha de eliminación). */
  mostrarActivar(user: Usuario): boolean {
    return !this.usuarioEstaActivo(user);
  }

  /** Mostrar si está activo (sin fecha de eliminación). */
  mostrarDesactivar(user: Usuario): boolean {
    return this.usuarioEstaActivo(user);
  }

  abrirConfirmacionActivar(user: Usuario): void {
    this.usuarioConfirmacion = user;
    this.accionConfirmacion = 'activar';
    this.errorApi = null;
    this.modalConfirmAbierto = true;
  }

  abrirConfirmacionDesactivar(user: Usuario): void {
    this.usuarioConfirmacion = user;
    this.accionConfirmacion = 'desactivar';
    this.errorApi = null;
    this.modalConfirmAbierto = true;
  }

  cerrarModalConfirm(): void {
    this.modalConfirmAbierto = false;
    this.usuarioConfirmacion = null;
    this.accionConfirmacion = null;
    this.errorApi = null;
  }

  confirmarAccionEstado(): void {
    const u = this.usuarioConfirmacion;
    const accion = this.accionConfirmacion;
    if (!u || !accion || this.guardando) {
      return;
    }
    this.guardando = true;
    this.errorApi = null;
    const req = { id: u.id };
    const obs =
      accion === 'activar'
        ? this.usuarioService.activar(req)
        : this.usuarioService.desactivar(req);
    obs.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModalConfirm();
        this.cargarUsuarios();
        const estado = accion === 'activar' ? 'activado' : 'desactivado';
        this.toastSuccess(`Usuario ${estado} correctamente`);
      },
      error: err => {
        this.guardando = false;
        this.errorApi = this.mensajeErrorHttp(err);
      }
    });
  }

  textoConfirmacion(): string {
    const u = this.usuarioConfirmacion;
    if (!u || !this.accionConfirmacion) {
      return '';
    }
    const nombre = `${u.nombres} ${u.apellidos}`.trim();
    return this.accionConfirmacion === 'activar'
      ? `¿Desea activar al usuario ${nombre}?`
      : `¿Desea desactivar al usuario ${nombre}?`;
  }

  private mensajeErrorHttp(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'No se pudo conectar con el servidor (red o CORS).';
      }
      const body = err.error;
      if (typeof body === 'string' && body.trim().length > 0) {
        try {
          const parsed = JSON.parse(body) as Record<string, unknown>;
          const fromJson = this.extraerMensajeCuerpoError(parsed);
          if (fromJson) {
            return fromJson;
          }
        } catch {
          return body.length > 200 ? body.slice(0, 200) + '…' : body;
        }
      }
      if (body && typeof body === 'object') {
        const fromObj = this.extraerMensajeCuerpoError(body as Record<string, unknown>);
        if (fromObj) {
          return fromObj;
        }
      }
      return `${err.status} ${err.statusText || ''}`.trim() || 'Error en la solicitud.';
    }
    if (err && typeof err === 'object' && 'error' in err) {
      const e = (err as { error?: unknown }).error;
      if (e && typeof e === 'object') {
        const m = this.extraerMensajeCuerpoError(e as Record<string, unknown>);
        if (m) {
          return m;
        }
      }
      if (typeof e === 'string' && e.length > 0) {
        return e;
      }
    }
    return 'Ocurrió un error. Intente nuevamente.';
  }

  private extraerMensajeCuerpoError(body: Record<string, unknown>): string | null {
    const msg = body['message'];
    if (typeof msg === 'string' && msg.length > 0) {
      return msg;
    }
    const detail = body['detail'];
    if (typeof detail === 'string' && detail.length > 0) {
      return detail;
    }
    const title = body['title'];
    if (typeof title === 'string' && title.length > 0) {
      return title;
    }
    const errors = body['errors'];
    if (errors && typeof errors === 'object') {
      const dict = errors as Record<string, string[]>;
      for (const key of Object.keys(dict)) {
        const arr = dict[key];
        if (Array.isArray(arr) && arr[0]) {
          return `${key}: ${arr[0]}`;
        }
      }
    }
    return null;
  }
}
