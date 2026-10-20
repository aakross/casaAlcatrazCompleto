import { Request, Response } from "express";
import { ObtenerReporteGeneralUseCase } from "../application/reportes.usecase";

export class ReportesController {
  // Recibe el caso de uso listo para ser ejecutado
  constructor(
    private readonly obtenerReporteGeneralUseCase: ObtenerReporteGeneralUseCase,
  ) {}

  // Usamos una función flecha para amarrar el contexto de 'this' en las rutas de Express
  obtenerReporteGeneral = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { fechaDesde, fechaHasta, estatusId } = req.query;

      // Despachamos los filtros hacia la capa de aplicación
      const data = await this.obtenerReporteGeneralUseCase.execute({
        fechaDesde: fechaDesde ? String(fechaDesde) : null,
        fechaHasta: fechaHasta ? String(fechaHasta) : null,
        estatusId: estatusId ? Number(estatusId) : null,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `[ReportesController] Error al compilar el reporte contable: ${error.message}`,
      });
    }
  };
  obtenerBitacoraBorrados = async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      // Despachamos la ejecución hacia el nuevo método del caso de uso unificado
      const data =
        await this.obtenerReporteGeneralUseCase.ejecutarObtenerBitacora();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `[ReportesController] Error al consultar la bitácora de auditoría: ${error.message}`,
      });
    }
  };
}
