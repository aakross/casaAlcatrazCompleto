import { apiClient } from "../../../core/api/apiClient";
import type {
  Region,
  Lugar,
  LocalComercial,
  ContratoRenta,
  PagoRenta,
  AuditoriaPagoRenta,
  AdeudoResumen,
  DashboardRentas,
} from "../domain/rentas.types";

export const rentasApi = {
  // Regiones
  async getRegiones(): Promise<Region[]> {
    const { data } = await apiClient.get<{ ok: boolean; data: Region[] }>("/rentas/regiones");
    return data.data;
  },

  async createRegion(body: { nombre: string; descripcion?: string }): Promise<Region> {
    const { data } = await apiClient.post<{ ok: boolean; data: Region }>("/rentas/regiones", body);
    return data.data;
  },

  // Lugares
  async getLugares(regionId?: number): Promise<Lugar[]> {
    const params = regionId ? { regionId } : {};
    const { data } = await apiClient.get<{ ok: boolean; data: Lugar[] }>("/rentas/lugares", { params });
    return data.data;
  },

  async createLugar(body: { region_id: number; nombre: string; direccion?: string }): Promise<Lugar> {
    const { data } = await apiClient.post<{ ok: boolean; data: Lugar }>("/rentas/lugares", body);
    return data.data;
  },

  // Locales
  async getLocales(lugarId?: number): Promise<LocalComercial[]> {
    const params = lugarId ? { lugarId } : {};
    const { data } = await apiClient.get<{ ok: boolean; data: LocalComercial[] }>("/rentas/locales", { params });
    return data.data;
  },

  async createLocal(body: {
    lugar_id: number;
    numero_fisico: string;
    nickname: string;
    monto_renta_sugerido: number;
    descripcion?: string;
  }): Promise<LocalComercial> {
    const { data } = await apiClient.post<{ ok: boolean; data: LocalComercial }>("/rentas/locales", body);
    return data.data;
  },

  async updateLocal(id: number, body: {
    lugar_id: number;
    numero_fisico: string;
    nickname: string;
    monto_renta_sugerido: number;
    descripcion?: string;
  }): Promise<void> {
    await apiClient.put(`/rentas/locales/${id}`, body);
  },

  async deleteLocal(id: number): Promise<void> {
    await apiClient.delete(`/rentas/locales/${id}`);
  },

  // Contratos
  async getContratos(localId?: number): Promise<ContratoRenta[]> {
    const params = localId ? { localId } : {};
    const { data } = await apiClient.get<{ ok: boolean; data: ContratoRenta[] }>("/rentas/contratos", { params });
    return data.data;
  },

  async createContrato(body: {
    local_id: number;
    arrendatario_nombre: string;
    arrendatario_telefono?: string;
    arrendatario_email?: string;
    fecha_inicio: string;
    fecha_fin?: string;
    monto_renta_mensual: number;
    dia_corte: number;
  }): Promise<ContratoRenta> {
    const { data } = await apiClient.post<{ ok: boolean; data: ContratoRenta }>("/rentas/contratos", body);
    return data.data;
  },

  async updateContrato(id: number, body: {
    arrendatario_nombre: string;
    arrendatario_telefono?: string;
    arrendatario_email?: string;
    fecha_fin?: string;
    monto_renta_mensual: number;
    dia_corte: number;
    vigente: boolean;
  }): Promise<void> {
    await apiClient.put(`/rentas/contratos/${id}`, body);
  },

  async finalizarContrato(id: number): Promise<void> {
    await apiClient.put(`/rentas/contratos/${id}/finalizar`);
  },

  // Pagos
  async getPagos(contratoId?: number): Promise<PagoRenta[]> {
    const params = contratoId ? { contratoId } : {};
    const { data } = await apiClient.get<{ ok: boolean; data: PagoRenta[] }>("/rentas/pagos", { params });
    return data.data;
  },

  async createPago(body: {
    contrato_id: number;
    monto: number;
    meses_cubiertos: number;
    fecha_abono_real: string;
    metodo_pago: string;
    referencia_bancaria?: string;
    nota?: string;
  }): Promise<PagoRenta> {
    const { data } = await apiClient.post<{ ok: boolean; data: PagoRenta }>("/rentas/pagos", body);
    return data.data;
  },

  async updatePago(id: number, body: {
    monto: number;
    meses_cubiertos: number;
    fecha_abono_real: string;
    metodo_pago: string;
    referencia_bancaria?: string;
    nota?: string;
    motivo_cambio: string;
  }): Promise<void> {
    await apiClient.put(`/rentas/pagos/${id}`, body);
  },

  async deletePago(id: number, motivo_cambio: string): Promise<void> {
    await apiClient.delete(`/rentas/pagos/${id}`, { data: { motivo_cambio } });
  },

  async getAuditoriaPago(pagoId: number): Promise<AuditoriaPagoRenta[]> {
    const { data } = await apiClient.get<{ ok: boolean; data: AuditoriaPagoRenta[] }>(`/rentas/pagos/auditoria/${pagoId}`);
    return data.data;
  },

  // Adeudos y Dashboard
  async getAdeudos(): Promise<AdeudoResumen[]> {
    const { data } = await apiClient.get<{ ok: boolean; data: AdeudoResumen[] }>("/rentas/adeudos");
    return data.data;
  },

  async getDashboard(): Promise<DashboardRentas> {
    const { data } = await apiClient.get<{ ok: boolean; data: DashboardRentas }>("/rentas/dashboard");
    return data.data;
  },
};
