// ─────────────────────────────────────────────────────────────────────────────
// Infrastructure — ApiEstadoResultadosRepository
// Implementación con Axios del repositorio del dominio.
// ─────────────────────────────────────────────────────────────────────────────
import { apiClient } from "../../../core/api/apiClient";
import type {
  IEstadoResultadosClientRepository,
  FiltrosEstadoResultados,
  EstadoResultadosData,
  CatalogosData,
  EgresoConcepto,
  EgresoDetalleItem,
  ExtraDetalleItem,
  FiltrosDetalleEgresos,
  FiltrosDetalleExtras,
  UltimoEgreso,
  CrearConceptoPayload,
  RegistrarEgresoPayload,
  ActualizarEgresoPayload,
  RegistrarProvisionIsrPayload,
} from "../domain/estado-resultados.repository";

const BASE = "/estado-resultados";

class ApiEstadoResultadosRepository
  implements IEstadoResultadosClientRepository
{
  async getEstadoResultados(
    filtros: FiltrosEstadoResultados
  ): Promise<EstadoResultadosData> {
    const params: Record<string, string | number> = {};
    if (filtros.anio !== undefined) params.anio = filtros.anio;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    if (filtros.provisionIsrManual !== undefined)
      params.provisionIsrManual = filtros.provisionIsrManual;

    const { data } = await apiClient.get<{
      success: boolean;
      data: EstadoResultadosData;
    }>(BASE, { params });
    return data.data;
  }

  async getAniosDisponibles(): Promise<number[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: number[];
    }>(`${BASE}/anios`);
    return data.data;
  }

  async getCatalogos(): Promise<CatalogosData> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: CatalogosData;
    }>(`${BASE}/catalogos`);
    return data.data;
  }

  async crearConcepto(payload: CrearConceptoPayload): Promise<EgresoConcepto> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: EgresoConcepto;
    }>(`${BASE}/conceptos`, payload);
    return data.data;
  }

  async registrarEgreso(
    payload: RegistrarEgresoPayload
  ): Promise<{ id: number }> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { id: number };
    }>(`${BASE}/egresos`, payload);
    return data.data;
  }

  async actualizarEgreso(
    payload: ActualizarEgresoPayload
  ): Promise<{ id: number }> {
    const { data } = await apiClient.put<{
      success: boolean;
      data: { id: number };
    }>(`${BASE}/egresos/${payload.id}`, payload);
    return data.data;
  }

  async registrarProvisionIsr(
    payload: RegistrarProvisionIsrPayload
  ): Promise<{ id: number }> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { id: number };
    }>(`${BASE}/provision-isr`, payload);
    return data.data;
  }

  async getUltimosEgresos(limite = 10): Promise<UltimoEgreso[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: UltimoEgreso[];
    }>(`${BASE}/ultimos-egresos`, { params: { limite } });
    return data.data;
  }

  async getDetalleEgresos(filtros: FiltrosDetalleEgresos): Promise<EgresoDetalleItem[]> {
    const params: Record<string, string | number> = {};
    if (filtros.categoriaId !== undefined) params.categoriaId = filtros.categoriaId;
    if (filtros.conceptoId !== undefined) params.conceptoId = filtros.conceptoId;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    if (filtros.anio !== undefined) params.anio = filtros.anio;

    const { data } = await apiClient.get<{
      success: boolean;
      data: EgresoDetalleItem[];
    }>(`${BASE}/egresos/detalle`, { params });
    return data.data;
  }

  async getDetalleExtras(filtros: FiltrosDetalleExtras): Promise<ExtraDetalleItem[]> {
    const params: Record<string, string | number> = {};
    if (filtros.concepto) params.concepto = filtros.concepto;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    if (filtros.anio !== undefined) params.anio = filtros.anio;

    const { data } = await apiClient.get<{
      success: boolean;
      data: ExtraDetalleItem[];
    }>(`${BASE}/extras/detalle`, { params });
    return data.data;
  }

  async getConceptosExtras(): Promise<string[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: string[];
    }>(`${BASE}/extras/conceptos`);
    return data.data;
  }
}

// Singleton
export const EstadoResultadosRepository =
  new ApiEstadoResultadosRepository();
