import {
  IResumenRepository,
  ResumenGeneralResponse,
} from "../domain/resumen.repository";

export interface ObtenerResumenUseCaseResponse {
  success: boolean;
  data: ResumenGeneralResponse;
}

export class ResumenUseCase {
  constructor(private resumenRepository: IResumenRepository) {}

  async execute(): Promise<ObtenerResumenUseCaseResponse> {
    const resumenData = await this.resumenRepository.obtenerResumenDashboard();
    return {
      success: true,
      data: resumenData,
    };
  }
}
