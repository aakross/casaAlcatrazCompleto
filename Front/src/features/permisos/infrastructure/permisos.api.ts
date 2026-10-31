import { apiClient } from "../../../core/api/apiClient";
import type {
  ModuloSistema,
  UsuarioConPermisos,
  VerificarTcausrResponse,
  CrearUsuarioDTO,
} from "../domain/permisos.types";

export const permisosApi = {
  async getModulos(): Promise<ModuloSistema[]> {
    const { data } = await apiClient.get<{ ok: boolean; data: ModuloSistema[] }>("/permisos/modulos");
    return data.data;
  },

  async getUsuarios(): Promise<UsuarioConPermisos[]> {
    const { data } = await apiClient.get<{ ok: boolean; data: UsuarioConPermisos[] }>("/permisos/usuarios");
    return data.data;
  },

  async togglePermiso(usuarioId: number, moduloClave: string, permitido: boolean): Promise<void> {
    await apiClient.post("/permisos/toggle", {
      usuario_id: usuarioId,
      modulo_clave: moduloClave,
      permitido,
    });
  },

  async toggleEstadoUsuario(usuarioId: number, activo: boolean): Promise<void> {
    await apiClient.post("/permisos/usuarios/toggle-estado", {
      usuario_id: usuarioId,
      activo,
    });
  },

  async guardarPermisos(usuarioId: number, modulos: string[]): Promise<void> {
    await apiClient.put(`/permisos/usuarios/${usuarioId}`, { modulos });
  },

  async verificarTcausr(username: string): Promise<VerificarTcausrResponse> {
    const { data } = await apiClient.post<{ ok: boolean; data: VerificarTcausrResponse }>(
      "/permisos/usuarios/verificar-tcausr",
      { username }
    );
    return data.data;
  },

  async crearUsuario(dto: CrearUsuarioDTO): Promise<{ id: number; username: string }> {
    const { data } = await apiClient.post<{ ok: boolean; data: { id: number; username: string }; message?: string }>(
      "/permisos/usuarios/crear",
      dto
    );
    return data.data;
  },
};
