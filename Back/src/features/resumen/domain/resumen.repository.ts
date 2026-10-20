export interface ResumenReservaciones {
  totalReservaciones: number;
  montoReservaciones: number;
}

export interface ResumenFinanciero {
  montosBrutos: number;
  comisiones: number;
  totalNeto: number;
}

export interface ResumenGeneralResponse {
  reservaciones: ResumenReservaciones;
  finanzas: ResumenFinanciero;
}

export interface MetricasFinancieras {
  totalBruto: number;
  totalComisiones: number;
  totalNetoGanado: number;
  hospedajeProyectado?: number; // Nueva métrica para el dueño
  utilidadProyectadaLibros?: number; // Nueva métrica para el dueño
}

export interface MetricasPlataforma {
  plataforma: string;
  cantidadReservaciones: number;
  totalDineroGenerado: number;
}

export interface MetricasHistoricas {
  totalReservasHistoricas: number;
  totalDiasReservados: number;
  totalHuespedesRecibidos: number;
  promedioDiasPorReserva: number;
}

export interface TopCliente {
  cliente: string;
  correo: string;
  cantidadViajes: number;
  totalDineroGastado: number;
}

export interface MetricasEstado {
  estado: string;
  cantidad: number;
}

// El objeto JSON final consolidado que se enviará al frontend
export interface DashboardCompletoResponse {
  finanzas: MetricasFinancieras;
  plataformas: MetricasPlataforma[];
  historico: MetricasHistoricas;
  topClientes: TopCliente[];
  estados: MetricasEstado[];
  hospedajeProyectado?: number;
}

export interface IResumenRepository {
  obtenerResumenDashboard(): Promise<ResumenGeneralResponse>;
  obtenerDashboardCompleto(): Promise<DashboardCompletoResponse>;
}
