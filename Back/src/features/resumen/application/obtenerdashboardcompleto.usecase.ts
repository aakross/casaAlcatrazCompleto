import {
  IResumenRepository,
  DashboardCompletoResponse,
} from "../domain/resumen.repository";

export interface ObtenerDashboardResponse {
  success: boolean;
  data: DashboardCompletoResponse;
}

export class ObtenerDashboardCompletoUseCase {
  constructor(private resumenRepository: IResumenRepository) {}

  async execute(): Promise<ObtenerDashboardResponse> {
    const dashboardData =
      await this.resumenRepository.obtenerDashboardCompleto();
    return {
      success: true,
      data: dashboardData,
    };
  }
}
