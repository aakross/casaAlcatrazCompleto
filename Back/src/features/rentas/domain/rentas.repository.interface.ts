import {
  Region,
  Lugar,
  LocalComercial,
  ContratoRenta,
  PagoRenta,
  AuditoriaPagoRenta,
  AdeudoResumen,
  DashboardRentas,
} from "./rentas.types";

export interface IRentasRepository {
  // Regiones
  obtenerRegiones(): Promise<Region[]>;
  crearRegion(nombre: string, descripcion: string | null, usuarioId: number): Promise<Region>;

  // Lugares
  obtenerLugares(regionId?: number): Promise<Lugar[]>;
  crearLugar(regionId: number, nombre: string, direccion: string | null, usuarioId: number): Promise<Lugar>;

  // Locales
  obtenerLocales(lugarId?: number): Promise<LocalComercial[]>;
  crearLocal(data: {
    lugar_id: number;
    numero_fisico: string;
    nickname: string;
    monto_renta_sugerido: number;
    descripcion?: string | null;
  }, usuarioId: number): Promise<LocalComercial>;
  actualizarLocal(id: number, data: {
    lugar_id: number;
    numero_fisico: string;
    nickname: string;
    monto_renta_sugerido: number;
    descripcion?: string | null;
  }, usuarioId: number): Promise<boolean>;
  eliminarLocal(id: number, usuarioId: number): Promise<boolean>;

  // Contratos
  obtenerContratos(localId?: number): Promise<ContratoRenta[]>;
  crearContrato(data: {
    local_id: number;
    arrendatario_nombre: string;
    arrendatario_telefono?: string | null;
    arrendatario_email?: string | null;
    fecha_inicio: string;
    fecha_fin?: string | null;
    monto_renta_mensual: number;
    dia_corte: number;
  }, usuarioId: number): Promise<ContratoRenta>;
  actualizarContrato(id: number, data: {
    arrendatario_nombre: string;
    arrendatario_telefono?: string | null;
    arrendatario_email?: string | null;
    fecha_fin?: string | null;
    monto_renta_mensual: number;
    dia_corte: number;
    vigente: boolean;
  }, usuarioId: number): Promise<boolean>;
  finalizarContrato(id: number, usuarioId: number): Promise<boolean>;

  // Pagos
  obtenerPagos(contratoId?: number): Promise<PagoRenta[]>;
  crearPago(data: {
    contrato_id: number;
    monto: number;
    meses_cubiertos: number;
    fecha_abono_real: string;
    metodo_pago: string;
    referencia_bancaria?: string | null;
    nota?: string | null;
  }, usuarioId: number): Promise<PagoRenta>;
  actualizarPagoConAuditoria(id: number, data: {
    monto: number;
    meses_cubiertos: number;
    fecha_abono_real: string;
    metodo_pago: string;
    referencia_bancaria?: string | null;
    nota?: string | null;
    motivo_cambio: string;
  }, usuarioId: number): Promise<boolean>;
  eliminarPagoConAuditoria(id: number, motivo_cambio: string, usuarioId: number): Promise<boolean>;
  obtenerAuditoriaPago(pagoId: number): Promise<AuditoriaPagoRenta[]>;

  // Adeudos y Dashboard
  obtenerControlAdeudos(): Promise<AdeudoResumen[]>;
  obtenerDashboard(): Promise<DashboardRentas>;
}
