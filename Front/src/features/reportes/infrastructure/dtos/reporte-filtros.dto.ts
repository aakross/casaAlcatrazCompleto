import { type FiltrosReporteParams } from "../../domain/reportes.repository";

export class ReporteFiltrosDto {
  static toQueryParams(filtros: FiltrosReporteParams): Record<string, string> {
    const params: Record<string, string> = {};

    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    if (filtros.estatusId) params.estatusId = filtros.estatusId.toString();

    return params;
  }
}
