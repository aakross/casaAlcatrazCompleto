export interface FiltrosReporteParams {
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  estatusId?: number | null;
}

export interface DetalleExtraDesglose {
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

export interface FilaReporteFinanciero {
  numeroReserva: number;
  cliente: string;
  fechaInicio: string;
  fechaFin: string;
  numeroHuespedes: number;
  totalNoches: number;
  plataforma: string;
  costoPorNoche: number;
  costoTotalReservacion: number;
  serviciosExtras: number;
  desgloseExtras: DetalleExtraDesglose[];
  totalEstancia: number;
  montoComisionPlataforma: number;
  pagosRecibidos: number;
  montoPendientePago: number;
  depositoGarantia: number;
  estatus: string;
}

export interface IReporteRepository {
  obtenerGeneral(
    filtros: FiltrosReporteParams,
  ): Promise<FilaReporteFinanciero[]>;
}
