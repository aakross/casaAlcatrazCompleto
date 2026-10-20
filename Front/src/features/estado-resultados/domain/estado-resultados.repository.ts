// ─────────────────────────────────────────────────────────────────────────────
// Domain — Estado de Resultados
// Interfaces y tipos puros, sin dependencias de infraestructura.
// ─────────────────────────────────────────────────────────────────────────────

export interface EgresoCategoria {
  id: number;
  clave: "VENTA" | "ADMINISTRACION" | "FINANCIEROS" | "SUELDOS_SALARIOS" | string;
  nombre: string;
  orden: number;
}

export interface EgresoConcepto {
  id: number;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
}

export interface EgresoMovimiento {
  id: number;
  conceptoId: number;
  monto: number;
  fechaGasto: string;
  referenciaComprobante: string | null;
  descripcion: string;
}

export interface ConceptoDetalle {
  categoriaId: number;
  categoriaClave: string;
  categoriaNombre: string;
  categoriaOrden: number;
  conceptoId: number;
  conceptoNombre: string;
  // Mensual (Periodo solicitado)
  totalConcepto: number;
  porcentajeSobreIngresos: number;
  cantidadMovimientos: number;
  // Acumulado (1 Ene a fechaHasta)
  totalConceptoAcumulado: number;
  porcentajeSobreIngresosAcumulado: number;
  cantidadMovimientosAcumulado: number;
  // Desglose de movimientos con descripción obligatoria
  movimientos: EgresoMovimiento[];
}

export interface CategoriaConSubtotal {
  categoriaId: number;
  categoriaClave: string;
  categoriaNombre: string;
  categoriaOrden: number;
  // Mensual
  subtotal: number;
  porcentajeSobreIngresos: number;
  // Acumulado
  subtotalAcumulado: number;
  porcentajeSobreIngresosAcumulado: number;
  conceptos: ConceptoDetalle[];
}

export interface EstadoResultadosResumen {
  fechaDesde: string;
  fechaHasta: string;
  fechaInicioAnio?: string;

  // ── Columna Mensual (Periodo) ──────────────────────────────────────────────
  totalIngresos: number;
  gastosVenta: number;
  gastosAdmin: number;
  gastosFinan: number;
  gastosSueldos: number;
  totalGastosOperacion: number;
  porcentajeGastosSobreIngresos: number;
  utilidadOperacion: number;
  provisionIsr: number;
  utilidadNeta: number;
  porcentajeUtilidadNetaSobreIngresos: number;

  // ── Columna Acumulado (1 Ene a fechaHasta) ─────────────────────────────────
  totalIngresosAcumulado: number;
  gastosVentaAcumulado: number;
  gastosAdminAcumulado: number;
  gastosFinanAcumulado: number;
  gastosSueldosAcumulado: number;
  totalGastosOperacionAcumulado: number;
  porcentajeGastosSobreIngresosAcumulado: number;
  utilidadOperacionAcumulado: number;
  provisionIsrAcumulado: number;
  utilidadNetaAcumulado: number;
  porcentajeUtilidadNetaSobreIngresosAcumulado: number;
}

export interface IngresoExtraDetalle {
  concepto: string;
  totalMensual: number;
  porcentajeSobreIngresos: number;
  totalAcumulado: number;
  porcentajeSobreIngresosAcumulado: number;
}

export interface IngresosDetalle {
  totalHospedajeMensual: number;
  cantidadReservasMensual: number;
  porcentajeHospedajeSobreIngresos: number;
  totalHospedajeAcumulado: number;
  cantidadReservasAcumulado: number;
  porcentajeHospedajeSobreIngresosAcumulado: number;
  extras: IngresoExtraDetalle[];
  totalIngresosMensual: number;
  totalIngresosAcumulado: number;
}

export interface EstadoResultadosData {
  resumen: EstadoResultadosResumen;
  ingresosDetalle?: IngresosDetalle;
  categorias: CategoriaConSubtotal[];
}

export interface UltimoEgreso {
  id: number;
  conceptoNombre: string;
  categoriaNombre: string;
  monto: number;
  fechaGasto: string;
  referenciaComprobante: string | null;
  descripcion: string;
  observaciones?: string | null;
}

// ── Filtros para la consulta principal ───────────────────────────────────────
export interface FiltrosEstadoResultados {
  anio?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  provisionIsrManual?: number;
}

// ── Catálogos ─────────────────────────────────────────────────────────────────
export interface CatalogosData {
  categorias: EgresoCategoria[];
  conceptos: EgresoConcepto[];
}

// ── Payloads de escritura ─────────────────────────────────────────────────────
export interface CrearConceptoPayload {
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  usuarioId: number;
}

export interface RegistrarEgresoPayload {
  conceptoId: number;
  monto: number;
  fechaGasto: string;
  referenciaComprobante?: string;
  descripcion: string;
  observaciones?: string;
  origenDineroId?: number;
  usuarioId: number;
}

export interface ActualizarEgresoPayload {
  id: number;
  conceptoId: number;
  monto: number;
  fechaGasto: string;
  referenciaComprobante?: string;
  descripcion: string;
  origenDineroId?: number;
  usuarioId: number;
  usuarioNombre?: string;
}

export interface RegistrarProvisionIsrPayload {
  fechaProvision: string;
  ejercicioAno: number;
  periodoMes?: number;
  monto: number;
  observaciones?: string;
  usuarioId: number;
}

export interface FiltrosDetalleEgresos {
  categoriaId?: number;
  conceptoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  anio?: number;
}

export interface EgresoDetalleItem {
  id: number;
  monto: number;
  fechaGasto: string;
  referenciaComprobante: string | null;
  descripcion: string;
  conceptoId: number;
  conceptoNombre: string;
  categoriaId: number;
  categoriaNombre: string;
}

export interface FiltrosDetalleExtras {
  concepto?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  anio?: number;
}

export interface ExtraDetalleItem {
  id: number;
  reservacionId: number;
  concepto: string;
  monto: number;
  cantidad: number;
  dias: number;
  precioUnitarioNoche: number;
  porcentajeComision: number;
  montoComision: number;
  tipoEvento: string | null;
  fechaInicioReserva: string;
  fechaFinReserva: string;
  clienteNombre: string;
  origenReserva: string;
}

// ── Contrato del repositorio del cliente ─────────────────────────────────────
export interface IEstadoResultadosClientRepository {
  getEstadoResultados(
    filtros: FiltrosEstadoResultados
  ): Promise<EstadoResultadosData>;
  getAniosDisponibles(): Promise<number[]>;
  getCatalogos(): Promise<CatalogosData>;
  crearConcepto(payload: CrearConceptoPayload): Promise<EgresoConcepto>;
  registrarEgreso(payload: RegistrarEgresoPayload): Promise<{ id: number }>;
  actualizarEgreso(payload: ActualizarEgresoPayload): Promise<{ id: number }>;
  registrarProvisionIsr(
    payload: RegistrarProvisionIsrPayload
  ): Promise<{ id: number }>;
  getUltimosEgresos(limite?: number): Promise<UltimoEgreso[]>;
  getDetalleEgresos(filtros: FiltrosDetalleEgresos): Promise<EgresoDetalleItem[]>;
  getDetalleExtras(filtros: FiltrosDetalleExtras): Promise<ExtraDetalleItem[]>;
  getConceptosExtras(): Promise<string[]>;
}
