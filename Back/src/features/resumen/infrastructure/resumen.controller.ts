import { Request, Response } from "express";
import { ResumenUseCase } from "../application/resumen.usecase";
import { ObtenerDashboardCompletoUseCase } from "../application/obtenerdashboardcompleto.usecase";

export class ResumenController {
  constructor(
    private resumenUseCase: ResumenUseCase,
    private obtenerDashboardUseCase: ObtenerDashboardCompletoUseCase,
  ) {}

  async obtenerResumen(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.resumenUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          (error as Error).message ||
          "Error al generar el resumen del dashboard",
      });
    }
  }

  async obtenerResumenCompleto(req: Request, res: Response): Promise<void> {
    try {
      // 3. Ejecutamos la acción (el caso de uso disparará los 5 queries en paralelo)
      const result = await this.obtenerDashboardUseCase.execute();

      // 4. Respondemos con éxito enviando el JSON consolidado
      res.status(200).json(result);
    } catch (error) {
      // 5. Cambiado a 500 porque si los queries fallan suele ser un error interno del servidor o BD
      res.status(500).json({
        success: false,
        error:
          (error as Error).message ||
          "Error al generar las métricas completas del dashboard",
      });
    }
  }
}
