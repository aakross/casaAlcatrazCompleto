// Contrato de los filtros que acepta el reporte
export interface FiltrosReporteDto {
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  estatusId?: number | null;
}

export interface DetalleExtraDesgloseDto {
  id: number;
  concepto: string;
  tipoEvento: string;
  cantidad: number;
  dias: number;
  precioUnitarioNoche: number;
  monto: number;
  porcentajeComision: number;
  montoComision: number;
}

export interface ReporteFinancieroEntity {
  numeroReserva: number;
  cliente: string;
  fechaInicio: Date;
  fechaFin: Date;
  numeroHuespedes: number;
  totalNoches: number;
  plataforma: string;
  detalleExtras: string;
  costoPorNoche: number;
  costoTotalReservacion: number;
  serviciosExtras: number;
  desgloseExtras: DetalleExtraDesgloseDto[];
  totalEstancia: number;
  montoComisionPlataforma: number;
  pagosRecibidos: number;
  montoPendientePago: number;
  depositoGarantia: number;
  estatus: string;
}

export interface ExtraEliminado {
  id: number;
  concepto: string;
  monto: number;
  cantidad: number;
  dias: number;
  precioNoche: number;
}

export interface BitacoraCambioItem {
  campo: string;
  valorAnterior: any;
  valorNuevo: any;
}

export interface BitacoraBorrado {
  id: number | string;
  tablaAfectada: string;
  registroId: number;
  usuarioId: string | number | null;
  fechaBorrado: Date | string;
  accion: "BORRADO" | "ACTUALIZACION" | "EDICION";
  detalles: {
    montoTotal?: number;
    fechaInicio?: string;
    fechaFin?: string;
    clienteNombre?: string;
    extras?: ExtraEliminado[];
    concepto?: string;
    descripcion?: string;
    referenciaComprobante?: string;
    resumen?: string;
    cambios?: BitacoraCambioItem[];
  };
}

// La interfaz que gobernará el comportamiento del repositorio
export interface IReporteRepository {
  obtenerReporteGeneral(
    filtros: FiltrosReporteDto,
  ): Promise<ReporteFinancieroEntity[]>;
  obtenerBitacoraBorrado(): Promise<BitacoraBorrado[]>;
}
