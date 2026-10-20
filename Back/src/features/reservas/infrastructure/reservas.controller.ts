import { Request, Response } from "express";
import { ListarReservasUseCase } from "../application/listarReservasUseCase";
import { BuscarReservaPorIdUseCase } from "../application/buscarReservaPorId.usecase";
import { CrearReservaUseCase } from "../application/crearReserva.usecase";
import { ObtenerOrigenesReservaUseCase } from "../application/obtenerOrigenesReserva.usecase";
import { ObtenerFechasOcupadasUseCase } from "../application/obtener-fechas-ocupadas.usecase";
import { ActualizarReservaUseCase } from "../application/actualizarReserva.usecase";
import { AgregarExtraUseCase } from "../application/agregarExtra.usecase";
import { EliminarReservaUseCase } from "../application/EliminarReservaUseCase";

export class ReservasController {
  // Inyectamos los 3 casos de uso independientes en el constructor
  constructor(
    private listarReservasUseCase: ListarReservasUseCase,
    private obtenerReservaPorIdUseCase: BuscarReservaPorIdUseCase,
    private crearReservaUseCase: CrearReservaUseCase,
    private obtenerOrigenesReservaUseCase: ObtenerOrigenesReservaUseCase,
    private obtenerFechasOcupadasUseCase: ObtenerFechasOcupadasUseCase,
    private agregarExtraUseCase: AgregarExtraUseCase,
    private actualizarReservaUseCase: ActualizarReservaUseCase,
    private eliminarReservaUseCase: EliminarReservaUseCase,
  ) {}

  async obtenerTodasLasReservas(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listarReservasUseCase.execute();

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message || "Error al obtener las reservas",
      });
    }
  }

  async obtenerReservaPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);

      if (!id || isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "El id de la reserva debe ser un número válido y es requerido",
        });
        return;
      }

      const result = await this.obtenerReservaPorIdUseCase.execute(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: (error as Error).message || "Error al obtener la reserva",
      });
    }
  }

  async crearReserva(req: Request, res: Response): Promise<void> {
    try {
      const {
        usuarioId,
        nombreCliente,
        apellidoCliente,
        telefono,
        email,
        fechaInicio,
        fechaFin,
        totalDiasReservacion,
        montoTotal,
        precioNoche,
        porcentajeComision,
        montoGarantia,
        origenReservaId,
        nuevoOrigenNombre,
        personasHospedadas,
        extras,
      } = req.body;

      if (
        !usuarioId ||
        !nombreCliente ||
        !apellidoCliente ||
        !telefono ||
        !fechaInicio ||
        !fechaFin ||
        !precioNoche ||
        origenReservaId === undefined ||
        origenReservaId === null ||
        origenReservaId === "" ||
        !personasHospedadas
      ) {
        res.status(400).json({
          success: false,
          error: "Faltan campos obligatorios para registrar la reservación",
        });
        return;
      }

      // La lógica de negocio "esOtro" vive ahora en el use case
      const result = await this.crearReservaUseCase.execute({
        usuarioId: Number(usuarioId),
        nombreCliente,
        apellidoCliente,
        telefono: telefono || null,
        email: email || null,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        totalDiasReservacion: Number(totalDiasReservacion),
        montoTotal: Number(montoTotal),
        precioNoche: Number(precioNoche || 0),
        porcentajeComision: Number(porcentajeComision || 0),
        montoGarantia: Number(montoGarantia || 0),
        origenReservaId: origenReservaId === "OTRO" ? 0 : Number(origenReservaId),
        nuevoOrigenNombre: origenReservaId === "OTRO" ? String(nuevoOrigenNombre) : undefined,
        personasHospedadas: Number(personasHospedadas),
        extras: Array.isArray(extras) ? extras : [],
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message || "Error al crear la reservación",
      });
    }
  }
  async obtenerOrigenesReserva(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerOrigenesReservaUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          (error as Error).message ||
          "Error al obtener el catálogo de orígenes de reserva",
      });
    }
  }

  async obtenerFechasOcupadas(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerFechasOcupadasUseCase.execute();

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          (error as Error).message || "Error al obtener las fechas ocupadas",
      });
    }
  }

  async agregarExtraAlMomento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { concepto, cantidad, dias, precioUnitarioNoche, usuarioId } =
        req.body;
      if (
        !id ||
        !concepto ||
        !cantidad ||
        !dias ||
        !precioUnitarioNoche ||
        !usuarioId
      ) {
        res.status(400).json({
          success: false,
          error:
            "Faltan campos obligatorios para agregar el servicio adicional",
        });
        return;
      }
      const result = await this.agregarExtraUseCase.execute({
        reservacionId: Number(id),
        concepto: String(concepto),
        cantidad: Number(cantidad),
        dias: Number(dias),
        precioUnitarioNoche: Number(precioUnitarioNoche),
        usuarioId: Number(usuarioId),
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          (error as Error).message || "Error al registrar el servicio extra",
      });
    }
  }

  async actualizarDatosReserva(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const {
        fechaInicio,
        fechaFin,
        totalDiasReservacion,
        precioNoche,
        personasHospedadas,
        usuarioId,
        extras,
        nombreHuesped,
        apellidoHuesped,
        telefono,
      } = req.body;

      // 1. Extraemos prioritariamente el ID del usuario desde req.user (inyectado por el middleware JWT)
      const resolvedUserId =
        req.user?.id ?? (usuarioId ? Number(usuarioId) : undefined);

      if (
        !id ||
        !fechaInicio ||
        !fechaFin ||
        !totalDiasReservacion ||
        !precioNoche ||
        !personasHospedadas ||
        !resolvedUserId ||
        isNaN(Number(resolvedUserId)) ||
        Number(resolvedUserId) <= 0
      ) {
        res.status(400).json({
          success: false,
          error:
            "Faltan campos obligatorios o el usuario operador no está autenticado.",
        });
        return;
      }
      const result = await this.actualizarReservaUseCase.execute({
        reservacionId: Number(id),
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        totalDiasReservacion: Number(totalDiasReservacion),
        precioNoche: Number(precioNoche),
        personasHospedadas: Number(personasHospedadas),
        usuarioId: Number(resolvedUserId),
        extras: Array.isArray(extras) ? extras : [],
        nombreHuesped: nombreHuesped ? String(nombreHuesped).trim() : null,
        apellidoHuesped: apellidoHuesped
          ? String(apellidoHuesped).trim()
          : null,
        telefono: telefono ? String(telefono).trim() : null,
        origenReservaId: req.body.origenReservaId ? Number(req.body.origenReservaId) : 1
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message || "Error al actualizar la reservación",
      });
    }
  }

  async eliminarReservacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 1. Extraemos prioritariamente el usuario autenticado desde req.user (inyectado por JWT)
      // con fallback secundario hacia body o query por si un cliente antiguo lo envía
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
            "Faltan parámetros obligatorios: No se pudo identificar la reservación o el usuario autenticado para procesar el borrado.",
        });
        return;
      }

      // Ejecutamos el caso de uso pasando el usuario asegurado
      const result = await this.eliminarReservaUseCase.execute({
        reservacionId: Number(id),
        usuarioId: Number(resolvedUserId),
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Error en el controlador al eliminar reserva:", error);
      res.status(400).json({
        success: false,
        error:
          (error as Error).message ||
          "Ocurrió un error inesperado al eliminar la reservación.",
      });
    }
  }
}
