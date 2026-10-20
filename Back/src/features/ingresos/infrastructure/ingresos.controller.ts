import { Request, Response } from "express";
import {
  CrearIngresoResponse,
  CrearIngresoUsecase,
} from "../application/crearIngreso.usecase";
import { BuscarPagosPorReservaUseCase } from "../application/detallePagosXCliente.usecase";
import { EliminarPagoUseCase } from "../application/EliminarPagoUseCase";

export class IngresosController {
  constructor(
    private crearIngresoUseCase: CrearIngresoUsecase,
    private buscarPagosPorReservaUseCase: BuscarPagosPorReservaUseCase,
    private eliminarPagoUseCase: EliminarPagoUseCase,
  ) {}

  async insertarIngreso(req: Request, res: Response): Promise<void> {
    try {
      const {
        origenDineroId,
        reservacionId,
        conceptoPagoId,
        montoBruto,
        aplicaComision,
        montoComision,
        userCreate,
        fechaDeposito,
      } = req.body;

      if (
        !origenDineroId ||
        !reservacionId ||
        !conceptoPagoId ||
        montoBruto === undefined ||
        aplicaComision === undefined ||
        montoComision === undefined ||
        !userCreate ||
        !fechaDeposito
      ) {
        res.status(400).json({
          success: false,
          error:
            "Faltan campos obligatorios para poder registrar el ingreso/pago",
        });
        return;
      }
      const result = await this.crearIngresoUseCase.execute({
        origenDineroId: Number(origenDineroId),
        reservacionId: Number(reservacionId),
        conceptoPagoId: Number(conceptoPagoId),
        montoBruto: Number(montoBruto),
        aplicaComision: Boolean(aplicaComision),
        montoComision: Number(montoComision),
        userCreate: Number(userCreate),
        fechaDeposito: new Date(fechaDeposito),
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          (error as Error).message ||
          "Error al procesar el registro del ingreso",
      });
    }
  }
  async obtenerPagosPorReserva(req: Request, res: Response): Promise<void> {
    try {
      const reservacionId = parseInt(`${req.params.id}`);
      if (!reservacionId || isNaN(reservacionId)) {
        res.status(400).json({
          success: false,
          error:
            "El id de la reservación debe ser un número válido y es requerido",
        });
        return;
      }
      const result =
        await this.buscarPagosPorReservaUseCase.execute(reservacionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          (error as Error).message || "Error al obtener el historial de pagos",
      });
    }
  }
  async eliminarAbonoDeCaja(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params; // ID del pago desde la URL

      // 1. Extraemos prioritariamente el usuario operador autenticado desde req.user (inyectado por JWT)
      const resolvedUserId =
        req.user?.id ??
        (req.body?.usuarioId ? Number(req.body.usuarioId) : undefined) ??
        (req.query?.usuarioId ? Number(req.query.usuarioId) : undefined);

      if (
        !id ||
        !resolvedUserId ||
        isNaN(Number(id)) ||
        isNaN(Number(resolvedUserId)) ||
        Number(resolvedUserId) <= 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "Faltan parámetros obligatorios: No se pudo identificar el abono o el usuario operador autenticado.",
        });
        return;
      }

      const result = await this.eliminarPagoUseCase.execute({
        pagoId: Number(id),
        usuarioId: Number(resolvedUserId),
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Error en el controlador al eliminar el pago:", error);
      res.status(400).json({
        success: false,
        error:
          (error as Error).message ||
          "Error al intentar eliminar el abono de caja.",
      });
    }
  }
}
