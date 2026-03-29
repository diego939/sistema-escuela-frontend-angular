export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: string;
  idRol: number | null;
  dni: string;
  urlImagen: string | null;
  token: string | null;
}

export interface UsuarioPaginadoResponse {
  data: Usuario[];
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}