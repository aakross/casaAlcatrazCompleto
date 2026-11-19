import { PermisosRepository } from "../infrastructure/database/permisos.repository";
import {
  ModuloSistema,
  UsuarioConPermisos,
  VerificarTcausrResult,
  CrearUsuarioRequest,
} from "../domain/permisos.types";

export class PermisosUseCase {
  constructor(private repository: PermisosRepository) {}

  async listarModulos(): Promise<ModuloSistema[]> {
    return this.repository.obtenerModulos();
  }

  async listarUsuariosConPermisos(): Promise<UsuarioConPermisos[]> {
    return this.repository.obtenerUsuariosConPermisos();
  }

  async alternarPermiso(
    usuarioId: number,
    moduloClave: string,
    permitido: boolean,
    usuarioAsignoId?: number
  ): Promise<boolean> {
    if (!usuarioId || usuarioId <= 0) throw new Error("ID de usuario inválido.");
    if (!moduloClave || !moduloClave.trim()) throw new Error("Clave de módulo requerida.");
    return this.repository.togglePermiso(usuarioId, moduloClave.trim(), permitido, usuarioAsignoId);
  }

  async alternarEstadoUsuario(
    usuarioId: number,
    activo: boolean,
    usuarioModifico?: string
  ): Promise<boolean> {
    if (!usuarioId || usuarioId <= 0) throw new Error("ID de usuario inválido.");
    return this.repository.toggleEstadoUsuario(usuarioId, activo, usuarioModifico);
  }

  async guardarPermisosUsuario(
    usuarioId: number,
    modulosClaves: string[],
    usuarioAsignoId?: number
  ): Promise<boolean> {
    if (!usuarioId || usuarioId <= 0) throw new Error("ID de usuario inválido.");
    return this.repository.asignarPermisosUsuario(usuarioId, modulosClaves, usuarioAsignoId);
  }

  async verificarUsuarioTcausr(username: string): Promise<VerificarTcausrResult> {
    if (!username || !username.trim()) {
      throw new Error("El identificador de usuario es obligatorio.");
    }
    return this.repository.verificarUsuarioTcausr(username.trim());
  }

  async crearUsuario(data: CrearUsuarioRequest): Promise<{ id: number; username: string }> {
    if (!data.username || !data.username.trim()) {
      throw new Error("El identificador de usuario es obligatorio.");
    }
    if (!data.rol_id) {
      throw new Error("El rol del usuario es obligatorio.");
    }
    return this.repository.crearUsuarioConPermisos(data);
  }

  async cambiarPasswordPrimerIngreso(usuarioId: number, nuevoPassword: string): Promise<boolean> {
    if (!usuarioId || usuarioId <= 0) throw new Error("ID de usuario inválido.");
    if (!nuevoPassword || nuevoPassword.trim().length < 4) {
      throw new Error("La nueva contraseña debe tener al menos 4 caracteres.");
    }
    return this.repository.cambiarPasswordPrimerIngreso(usuarioId, nuevoPassword);
  }
}
