import type { IDashboardCorte } from "../../domain/cortes.repository";
import { apiClient } from "../../../../core/api/apiClient";
import { type CorteRepository } from "../cortes.repository";
import { type DashboardCorteResponseDTO } from "../dtos/corte.dto";
import { apiToDashboardCorteAdapter } from "../adapters/corte.adapter";

export class ApiCorteRepository implements CorteRepository {
  async getDashboardData(): Promise<IDashboardCorte> {
    // Reemplaza '/cortes/dashboard' por tu endpoint real
    const response =
      await apiClient.get<DashboardCorteResponseDTO>("/resumen/dashboard");
    return apiToDashboardCorteAdapter(response.data);
  }
}
