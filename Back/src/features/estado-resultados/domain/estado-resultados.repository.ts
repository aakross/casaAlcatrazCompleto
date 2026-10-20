// =========================================================================
// DOMINIO: ESTADO DE RESULTADOS Y GESTIÓN DE EGRESOS
// =========================================================================

export interface EgresoCategoria {
  id: number;
  clave: string;
  nombre: string;
  orden: number;
}

export interface EgresoConcepto {
  id: number;
  categoriaId: number;
  categoriaNombre?: string;
  nombre: string;
  descripcion?: string | null;
  esSistema: boolean;
  activo?: boolean;
}

export interface RegistrarEgresoInput {
  conceptoId: number;
  monto: number;
  fechaGasto: Date;
  referenciaComprobante?: string | null;
  descripcion: string;
  observaciones?: string | null;
  origenDineroId?: number | null;
  usuarioId: number;
}

export interface ActualizarEgresoInput {
  id: number;
  conceptoId: number;
  monto: number;
  fechaGasto: Date;
  referenciaComprobante?: string | null;
  descripcion: string;
  origenDineroId?: number | null;
  usuarioId: number;
  usuarioNombre?: string | null;
}

export interface CrearConceptoInput {
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  usuarioId: number;
}

export interface RegistrarProvisionIsrInput {
  fechaProvision: Date;
  ejercicioAno: number;
  periodoMes?: number | null;
  monto: number;
  observaciones?: string | null;
  usuarioId: number;
}

export interface FiltrosEstadoResultadosInput {
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  anio?: number | null;
  provisionIsrManual?: number | null;
}

export interface EgresoMovimiento {
  id: number;
  conceptoId: number;
  monto: number;
  fechaGasto: string;
  referenciaComprobante?: string | null;
  descripcion: string;
}

export interface DesgloseConcepto {
  categoriaId: number;
  categoriaClave: string;
  categoriaNombre: string;
  categoriaOrden: number;
  conceptoId: number;
  conceptoNombre: string;
  // Mensual (o Periodo seleccionado)
  totalConcepto: number;
  porcentajeSobreIngresos: number;
  cantidadMovimientos: number;
  // Acumulado (1 Ene a fechaHasta)
  totalConceptoAcumulado: number;
  porcentajeSobreIngresosAcumulado: number;
  cantidadMovimientosAcumulado: number;
  // Desglose de movimientos del periodo con su descripción obligatoria
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
  conceptos: DesgloseConcepto[];
}

export interface EstadoResultadosResumen {
  fechaDesde: string;
  fechaHasta: string;
  fechaInicioAnio: string;

  // ── Columna Mensual (Periodo seleccionado) ─────────────────────────────────
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

  // ── Columna Acumulada (1 Ene a fechaHasta) ─────────────────────────────────
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

export interface EstadoResultadosResponse {
  resumen: EstadoResultadosResumen;
  ingresosDetalle?: IngresosDetalle;
  categorias: CategoriaConSubtotal[];
}

export interface FiltrosDetalleEgresosInput {
  categoriaId?: number | null;
  conceptoId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  anio?: number | null;
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

export interface FiltrosDetalleExtrasInput {
  concepto?: string | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  anio?: number | null;
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

export interface IEstadoResultadosRepository {
  obtenerEstadoResultados(
    filtros: FiltrosEstadoResultadosInput,
  ): Promise<EstadoResultadosResponse>;
  obtenerAniosDisponibles(): Promise<number[]>;
  obtenerCategorias(): Promise<EgresoCategoria[]>;
  obtenerConceptos(): Promise<EgresoConcepto[]>;
  crearConcepto(input: CrearConceptoInput): Promise<EgresoConcepto>;
  registrarEgreso(input: RegistrarEgresoInput): Promise<{ id: number; message: string }>;
  actualizarEgreso(input: ActualizarEgresoInput): Promise<{ id: number; message: string }>;
  registrarProvisionIsr(
    input: RegistrarProvisionIsrInput,
  ): Promise<{ id: number; message: string }>;
  obtenerUltimosEgresos(limite?: number): Promise<any[]>;
  obtenerDetalleEgresos(filtros: FiltrosDetalleEgresosInput): Promise<EgresoDetalleItem[]>;
  obtenerDetalleExtras(filtros: FiltrosDetalleExtrasInput): Promise<ExtraDetalleItem[]>;
  obtenerConceptosExtras(): Promise<string[]>;
}
