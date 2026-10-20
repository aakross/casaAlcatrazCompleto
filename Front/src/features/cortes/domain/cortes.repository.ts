export interface Finanzas {
  totalBruto: number;
  totalComisiones: number;
  totalNetoGanado: number;
}

export interface PlataformaInfo {
  plataforma: string;
  cantidadReservaciones: number;
  totalDineroGenerado: number;
}

export interface Historico {
  totalReservasHistoricas: number;
  totalDiasReservados: number;
  totalHuespedesRecibidos: number;
  promedioDiasPorReserva: number;
}

export interface TopCliente {
  cliente: string;
  correo: string | null;
  cantidadViajes: number;
  totalDineroGastado: number;
}

export interface EstadoReserva {
  estado: string;
  cantidad: number;
}

export interface IDashboardCorte {
  finanzas: Finanzas;
  plataformas: PlataformaInfo[];
  historico: Historico;
  topClientes: TopCliente[];
  estados: EstadoReserva[];
}
