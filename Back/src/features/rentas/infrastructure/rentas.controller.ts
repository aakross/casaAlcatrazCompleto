import { Request, Response } from "express";
import { RentasUseCase } from "../application/rentas.usecase";

export class RentasController {
  constructor(private readonly useCase: RentasUseCase) {}

  // Helper para obtener el ID del usuario del token JWT o fallback a 1 (sistemas)
  private getUserId(req: Request): number {
    return req.user?.id || 1;
  }

  // =========================================================================
  // REGIONES
  // =========================================================================
  async getRegiones(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.useCase.listarRegiones();
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener regiones" });
    }
  }

  async createRegion(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, descripcion } = req.body;
      const usuarioId = this.getUserId(req);
      const data = await this.useCase.crearRegion(nombre, descripcion, usuarioId);
      res.status(201).json({ ok: true, data, message: "Región creada con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al crear región" });
    }
  }

  // =========================================================================
  // LUGARES
  // =========================================================================
  async getLugares(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId ? Number(req.query.regionId) : undefined;
      const data = await this.useCase.listarLugares(regionId);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener lugares" });
    }
  }

  async createLugar(req: Request, res: Response): Promise<void> {
    try {
      const { region_id, nombre, direccion } = req.body;
      const usuarioId = this.getUserId(req);
      const data = await this.useCase.crearLugar(Number(region_id), nombre, direccion, usuarioId);
      res.status(201).json({ ok: true, data, message: "Lugar creado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al crear lugar" });
    }
  }

  // =========================================================================
  // LOCALES
  // =========================================================================
  async getLocales(req: Request, res: Response): Promise<void> {
    try {
      const lugarId = req.query.lugarId ? Number(req.query.lugarId) : undefined;
      const data = await this.useCase.listarLocales(lugarId);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener locales" });
    }
  }

  async createLocal(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = this.getUserId(req);
      const data = await this.useCase.crearLocal(req.body, usuarioId);
      res.status(201).json({ ok: true, data, message: "Local creado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al crear local" });
    }
  }

  async updateLocal(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const usuarioId = this.getUserId(req);
      const success = await this.useCase.actualizarLocal(id, req.body, usuarioId);
      if (!success) {
        res.status(404).json({ ok: false, error: "Local no encontrado o inactivo" });
        return;
      }
      res.status(200).json({ ok: true, message: "Local actualizado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al actualizar local" });
    }
  }

  async deleteLocal(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const usuarioId = this.getUserId(req);
      const success = await this.useCase.eliminarLocal(id, usuarioId);
      if (!success) {
        res.status(404).json({ ok: false, error: "Local no encontrado" });
        return;
      }
      res.status(200).json({ ok: true, message: "Local dado de baja lógicamente con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al dar de baja el local" });
    }
  }

  // =========================================================================
  // CONTRATOS
  // =========================================================================
  async getContratos(req: Request, res: Response): Promise<void> {
    try {
      const localId = req.query.localId ? Number(req.query.localId) : undefined;
      const data = await this.useCase.listarContratos(localId);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener contratos" });
    }
  }

  async createContrato(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = this.getUserId(req);
      const data = await this.useCase.crearContrato(req.body, usuarioId);
      res.status(201).json({ ok: true, data, message: "Contrato creado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al crear contrato" });
    }
  }

  async updateContrato(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const usuarioId = this.getUserId(req);
      const success = await this.useCase.actualizarContrato(id, req.body, usuarioId);
      if (!success) {
        res.status(404).json({ ok: false, error: "Contrato no encontrado o inactivo" });
        return;
      }
      res.status(200).json({ ok: true, message: "Contrato actualizado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al actualizar contrato" });
    }
  }

  async finalizarContrato(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const usuarioId = this.getUserId(req);
      const success = await this.useCase.finalizarContrato(id, usuarioId);
      if (!success) {
        res.status(404).json({ ok: false, error: "Contrato no encontrado" });
        return;
      }
      res.status(200).json({ ok: true, message: "Contrato finalizado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al finalizar contrato" });
    }
  }

  // =========================================================================
  // PAGOS
  // =========================================================================
  async getPagos(req: Request, res: Response): Promise<void> {
    try {
      const contratoId = req.query.contratoId ? Number(req.query.contratoId) : undefined;
      const data = await this.useCase.listarPagos(contratoId);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener pagos" });
    }
  }

  async createPago(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = this.getUserId(req);
      const data = await this.useCase.crearPago(req.body, usuarioId);
      res.status(201).json({ ok: true, data, message: "Pago registrado con éxito" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al registrar pago" });
    }
  }

  async updatePagoConAuditoria(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const usuarioId = this.getUserId(req);
      const success = await this.useCase.actualizarPagoConAuditoria(id, req.body, usuarioId);
      if (!success) {
        res.status(404).json({ ok: false, error: "Pago no encontrado o inactivo" });
        return;
      }
      res.status(200).json({ ok: true, message: "Pago modificado y registrado en bitácora de auditoría" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al actualizar pago" });
    }
  }

  async deletePagoConAuditoria(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { motivo_cambio } = req.body;
      const usuarioId = this.getUserId(req);
      const success = await this.useCase.eliminarPagoConAuditoria(id, motivo_cambio, usuarioId);
      if (!success) {
        res.status(404).json({ ok: false, error: "Pago no encontrado" });
        return;
      }
      res.status(200).json({ ok: true, message: "Pago dado de baja lógicamente y registrado en bitácora" });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message || "Error al eliminar pago" });
    }
  }

  async getAuditoriaPago(req: Request, res: Response): Promise<void> {
    try {
      const pagoId = Number(req.params.pagoId);
      const data = await this.useCase.obtenerAuditoriaPago(pagoId);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al obtener bitácora de pago" });
    }
  }

  // =========================================================================
  // CONTROL DE ADEUDOS Y DASHBOARD
  // =========================================================================
  async getAdeudos(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.useCase.obtenerControlAdeudos();
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al calcular adeudos" });
    }
  }

  async getDashboard(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.useCase.obtenerDashboard();
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message || "Error al generar dashboard de rentas" });
    }
  }
}
