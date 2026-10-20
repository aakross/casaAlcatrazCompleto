export interface DashboardCorteResponseDTO {
  success: boolean;
  data: {
    finanzas: {
      totalBruto: number;
      totalComisiones: number;
      totalNetoGanado: number;
    };
    plataformas: Array<{
      plataforma: string;
      cantidadReservaciones: number;
      totalDineroGenerado: number;
    }>;
    historico: {
      totalReservasHistoricas: number;
      totalDiasReservados: number;
      totalHuespedesRecibidos: number;
      promedioDiasPorReserva: number;
    };
    topClientes: Array<{
      cliente: string;
      correo: string | null;
      cantidadViajes: number;
      totalDineroGastado: number;
    }>;
    estados: Array<{
      estado: string;
      cantidad: number;
    }>;
  };
}
