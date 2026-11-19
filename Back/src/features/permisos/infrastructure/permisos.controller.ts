import { Request, Response } from "express";
import { PermisosUseCase } from "../application/permisos.usecase";

export class PermisosController {
  constructor(private useCase: PermisosUseCase) {}

  private getUserId(req: Request): number {
    return (req as any).user?.id || 1;
  }

  async getModulos(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.useCase.listarModulos();
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener módulos" });
    }
  }

  async getUsuariosConPermisos(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.useCase.listarUsuariosConPermisos();
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener usuarios y permisos" });
    }
  }

  async togglePermiso(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id, modulo_clave, permitido } = req.body;
      const usuarioAsignoId = this.getUserId(req);

      const success = await this.useCase.alternarPermiso(
        Number(usuario_id),
        modulo_clave,
        Boolean(permitido),
        usuarioAsignoId
      );

      res.status(200).json({ ok: true, success, message: "Permiso actualizado correctamente" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al actualizar permiso" });
    }
  }

  async toggleEstadoUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id, activo } = req.body;
      const usuarioModifico = (req as any).user?.user || "ADMIN";

      const success = await this.useCase.alternarEstadoUsuario(
        Number(usuario_id),
        Boolean(activo),
        usuarioModifico
      );

      res.status(200).json({
        ok: true,
        success,
        message: `Usuario ${activo ? "activado" : "inactivado"} exitosamente`,
      });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al cambiar estado del usuario" });
    }
  }

  async guardarPermisosUsuario(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = Number(req.params.id);
      const { modulos } = req.body;
      const usuarioAsignoId = this.getUserId(req);

      if (!Array.isArray(modulos)) {
        res.status(400).json({ ok: false, error: "El listado de módulos debe ser un arreglo de claves" });
        return;
      }

      const success = await this.useCase.guardarPermisosUsuario(
        usuarioId,
        modulos,
        usuarioAsignoId
      );

      res.status(200).json({ ok: true, success, message: "Permisos del usuario guardados con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al guardar permisos" });
    }
  }

  async verificarTcausr(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body;
      const result = await this.useCase.verificarUsuarioTcausr(username);
      res.status(200).json({ ok: true, data: result });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al verificar usuario en tcausr" });
    }
  }

  async crearUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { username, rol_id, modulos, esDeTcausr, passwordTemporal } = req.body;
      const usuarioCreo = (req as any).user?.user || "ADMIN";

      const nuevoUsuario = await this.useCase.crearUsuario({
        username,
        rol_id: Number(rol_id),
        modulos: Array.isArray(modulos) ? modulos : [],
        esDeTcausr: Boolean(esDeTcausr),
        passwordTemporal,
        usuarioCreo,
      });

      res.status(201).json({
        ok: true,
        data: nuevoUsuario,
        message: "Usuario registrado y configurado con éxito",
      });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al crear usuario" });
    }
  }

  async cambiarPasswordPrimerIngreso(req: Request, res: Response): Promise<void> {
    try {
      const { usuario_id, nuevo_password } = req.body;
      const success = await this.useCase.cambiarPasswordPrimerIngreso(
        Number(usuario_id),
        nuevo_password
      );

      res.status(200).json({
        ok: true,
        success,
        message: "Contraseña actualizada con éxito.",
      });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al actualizar contraseña" });
    }
  }
}
