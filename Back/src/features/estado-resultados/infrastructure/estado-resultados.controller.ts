import { Request, Response } from "express";
import { ObtenerEstadoResultadosUseCase } from "../application/obtener-estado-resultados.usecase";
import { ObtenerAniosDisponiblesUseCase } from "../application/obtener-anios-disponibles.usecase";
import { ObtenerCatalogosEgresosUseCase } from "../application/obtener-catalogos.usecase";
import { CrearConceptoEgresoUseCase } from "../application/crear-concepto-egreso.usecase";
import { RegistrarEgresoUseCase } from "../application/registrar-egreso.usecase";
import { ActualizarEgresoUseCase } from "../application/actualizar-egreso.usecase";
import { RegistrarProvisionIsrUseCase } from "../application/registrar-provision-isr.usecase";
import { ObtenerDetalleEgresosUseCase } from "../application/obtener-detalle-egresos.usecase";
import { ObtenerUltimosEgresosUseCase } from "../application/obtener-ultimos-egresos.usecase";
import { ObtenerDetalleExtrasUseCase } from "../application/obtener-detalle-extras.usecase";
import { ObtenerConceptosExtrasUseCase } from "../application/obtener-conceptos-extras.usecase";

export class EstadoResultadosController {
  constructor(
    private obtenerEstadoResultadosUseCase: ObtenerEstadoResultadosUseCase,
    private obtenerAniosDisponiblesUseCase: ObtenerAniosDisponiblesUseCase,
    private obtenerCatalogosEgresosUseCase: ObtenerCatalogosEgresosUseCase,
    private crearConceptoEgresoUseCase: CrearConceptoEgresoUseCase,
    private registrarEgresoUseCase: RegistrarEgresoUseCase,
    private actualizarEgresoUseCase: ActualizarEgresoUseCase,
    private registrarProvisionIsrUseCase: RegistrarProvisionIsrUseCase,
    private obtenerDetalleEgresosUseCase: ObtenerDetalleEgresosUseCase,
    private obtenerUltimosEgresosUseCase: ObtenerUltimosEgresosUseCase,
    private obtenerDetalleExtrasUseCase: ObtenerDetalleExtrasUseCase,
    private obtenerConceptosExtrasUseCase: ObtenerConceptosExtrasUseCase,
  ) {}

  async obtenerEstadoResultados(req: Request, res: Response): Promise<void> {
    try {
      const { fechaDesde, fechaHasta, anio, provisionIsrManual } = req.query;

      const resultado = await this.obtenerEstadoResultadosUseCase.execute({
        fechaDesde: fechaDesde ? String(fechaDesde) : null,
        fechaHasta: fechaHasta ? String(fechaHasta) : null,
        anio: anio ? Number(anio) : null,
        provisionIsrManual: provisionIsrManual !== undefined && provisionIsrManual !== "" ? Number(provisionIsrManual) : null,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al calcular el Estado de Resultados.",
      });
    }
  }

  async obtenerAniosDisponibles(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.obtenerAniosDisponiblesUseCase.execute();
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al obtener los años disponibles.",
      });
    }
  }

  async obtenerCatalogos(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.obtenerCatalogosEgresosUseCase.execute();
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al obtener catálogo de egresos.",
      });
    }
  }

  async crearConcepto(req: Request, res: Response): Promise<void> {
    try {
      const { categoriaId, nombre, descripcion, usuarioId } = req.body;

      if (!categoriaId || !nombre) {
        res.status(400).json({
          success: false,
          error: "La categoría y el nombre del concepto son obligatorios.",
        });
        return;
      }

      const resultado = await this.crearConceptoEgresoUseCase.execute({
        categoriaId: Number(categoriaId),
        nombre: String(nombre),
        descripcion: descripcion ? String(descripcion) : null,
        usuarioId: Number(usuarioId || 1),
      });

      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Error al registrar el concepto.",
      });
    }
  }

  async registrarEgreso(req: Request, res: Response): Promise<void> {
    try {
      const {
        conceptoId,
        monto,
        fechaGasto,
        referenciaComprobante,
        descripcion,
        observaciones,
        origenDineroId,
        usuarioId,
      } = req.body;

      const descFinal = descripcion || observaciones;

      if (!conceptoId || !monto || !fechaGasto || !descFinal) {
        res.status(400).json({
          success: false,
          error: "Concepto, monto, fecha de gasto y descripción son obligatorios.",
        });
        return;
      }

      const resolvedUserId = req.user?.id ?? (usuarioId ? Number(usuarioId) : 1);

      const resultado = await this.registrarEgresoUseCase.execute({
        conceptoId: Number(conceptoId),
        monto: Number(monto),
        fechaGasto: new Date(fechaGasto),
        referenciaComprobante: referenciaComprobante ? String(referenciaComprobante) : null,
        descripcion: String(descFinal).trim(),
        observaciones: String(descFinal).trim(),
        origenDineroId: origenDineroId ? Number(origenDineroId) : null,
        usuarioId: Number(resolvedUserId),
      });

      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Error al registrar el egreso.",
      });
    }
  }

  async actualizarEgreso(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id ? Number(req.params.id) : Number(req.body.id);
      const {
        conceptoId,
        monto,
        fechaGasto,
        referenciaComprobante,
        descripcion,
        observaciones,
        origenDineroId,
        usuarioId,
        usuarioNombre,
      } = req.body;

      const descFinal = descripcion || observaciones;

      if (!idParam || isNaN(idParam)) {
        res.status(400).json({
          success: false,
          error: "El ID del egreso a actualizar es obligatorio.",
        });
        return;
      }

      if (!conceptoId || !monto || !fechaGasto || !descFinal) {
        res.status(400).json({
          success: false,
          error: "Concepto, monto, fecha de gasto y descripción son obligatorios.",
        });
        return;
      }

      const resolvedUserId = (req as any).user?.id ?? (usuarioId ? Number(usuarioId) : 1);
      const resolvedUserName = (req as any).user?.username ?? (usuarioNombre ? String(usuarioNombre) : null);

      const resultado = await this.actualizarEgresoUseCase.execute({
        id: Number(idParam),
        conceptoId: Number(conceptoId),
        monto: Number(monto),
        fechaGasto: new Date(fechaGasto),
        referenciaComprobante: referenciaComprobante ? String(referenciaComprobante).trim() : null,
        descripcion: String(descFinal).trim(),
        origenDineroId: origenDineroId ? Number(origenDineroId) : null,
        usuarioId: Number(resolvedUserId),
        usuarioNombre: resolvedUserName,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Error al actualizar el egreso.",
      });
    }
  }

  async registrarProvisionIsr(req: Request, res: Response): Promise<void> {
    try {
      const { fechaProvision, ejercicioAno, periodoMes, monto, observaciones, usuarioId } = req.body;

      if (monto === undefined || monto === null) {
        res.status(400).json({
          success: false,
          error: "El monto de la provisión de ISR es obligatorio.",
        });
        return;
      }

      const resultado = await this.registrarProvisionIsrUseCase.execute({
        fechaProvision: fechaProvision ? new Date(fechaProvision) : new Date(),
        ejercicioAno: Number(ejercicioAno || new Date().getFullYear()),
        periodoMes: periodoMes ? Number(periodoMes) : null,
        monto: Number(monto),
        observaciones: observaciones ? String(observaciones) : null,
        usuarioId: Number(usuarioId || 1),
      });

      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Error al registrar la provisión de ISR.",
      });
    }
  }

  async obtenerUltimosEgresos(req: Request, res: Response): Promise<void> {
    try {
      const limite = req.query.limite ? Number(req.query.limite) : 10;
      const resultado = await this.obtenerUltimosEgresosUseCase.execute(limite);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al obtener últimos egresos.",
      });
    }
  }

  async obtenerDetalleEgresos(req: Request, res: Response): Promise<void> {
    try {
      const { categoriaId, conceptoId, fechaDesde, fechaHasta, anio } = req.query;

      const resultado = await this.obtenerDetalleEgresosUseCase.execute({
        categoriaId: categoriaId ? Number(categoriaId) : null,
        conceptoId: conceptoId ? Number(conceptoId) : null,
        fechaDesde: fechaDesde ? String(fechaDesde) : null,
        fechaHasta: fechaHasta ? String(fechaHasta) : null,
        anio: anio ? Number(anio) : null,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al obtener el detalle de egresos.",
      });
    }
  }

  async obtenerDetalleExtras(req: Request, res: Response): Promise<void> {
    try {
      const { concepto, fechaDesde, fechaHasta, anio } = req.query;

      const resultado = await this.obtenerDetalleExtrasUseCase.execute({
        concepto: concepto ? String(concepto) : null,
        fechaDesde: fechaDesde ? String(fechaDesde) : null,
        fechaHasta: fechaHasta ? String(fechaHasta) : null,
        anio: anio ? Number(anio) : null,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al obtener el detalle de extras.",
      });
    }
  }

  async obtenerConceptosExtras(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await this.obtenerConceptosExtrasUseCase.execute();
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Error al obtener conceptos de extras.",
      });
    }
  }
}
