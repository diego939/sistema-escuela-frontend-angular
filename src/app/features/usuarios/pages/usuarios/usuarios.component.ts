import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Rol, Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

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
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  trackByUsuarioId(_: number, u: Usuario): number {
    return u.id;
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
        idRol: v.idRol as number,
        urlImagen: v.urlImagen ?? ''
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModalEditar();
          this.cargarUsuarios();
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
