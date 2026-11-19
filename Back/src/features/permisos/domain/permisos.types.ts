export interface ModuloSistema {
  id: number;
  clave: string;
  nombre: string;
  ruta: string;
  icono: string;
  orden: number;
  activo: boolean;
}

export interface UsuarioConPermisos {
  id: number;
  username: string;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  origen: string;
  permisos: string[];
  debe_cambiar_password?: boolean;
}

export interface VerificarTcausrResult {
  existeEnTcausr: boolean;
  yaRegistrado: boolean;
  datosTcausr?: {
    nombre: string;
    nombreCompleto: string;
    puesto: string;
  };
}

export interface CrearUsuarioRequest {
  username: string;
  rol_id: number;
  modulos: string[];
  esDeTcausr: boolean;
  passwordTemporal?: string;
  usuarioCreo?: string;
}
