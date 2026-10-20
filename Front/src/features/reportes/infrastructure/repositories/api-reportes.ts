import { apiClient } from "../../../../core/api/apiClient";
import {
  type FilaReporteFinanciero,
  type IReporteRepository,
  type FiltrosReporteParams,
} from "../../domain/reportes.repository";
import { ReporteFiltrosDto } from "../dtos/reporte-filtros.dto";

export class ApiReportesRepository implements IReporteRepository {
  async obtenerGeneral(
    filtros: FiltrosReporteParams,
  ): Promise<FilaReporteFinanciero[]> {
    const queryParams = ReporteFiltrosDto.toQueryParams(filtros);

    // Consumimos el nuevo endpoint del backend
    const response = await apiClient.get<{
      success: boolean;
      data: FilaReporteFinanciero[];
    }>("/reportes/general", { params: queryParams });

    return response.data?.data || [];
  }
}
