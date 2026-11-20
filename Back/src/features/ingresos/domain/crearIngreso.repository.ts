export interface Ingreso {
  id?: number;
  origenDineroId: number;
  reservacionId: number;
  conceptoPagoId: number;
  montoBruto: number;
  aplicaComision: boolean;
  montoComision: number;
  userCreate: number;
  fechaDeposito: Date;
  observaciones?: string;
}

export interface DetallePagosCliente {
  id?: number;
  folioReserva: number;
  origenDineroId?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  fechaInicio: Date;
  fechaFin: Date;
  estadoReservacion: string;
  conceptoDePagoId: number;
  conceptoPago: string;
  montoTotalReserva: number;
  montoBrutoPago: number;
  aplicaComisionPago: boolean;
  montoComisionPago: number;
  montoNetoPago: number;
  fechaRegistroPago: string | Date;
  fechaDeposito: string | Date;
  observaciones?: string;
}

export interface IIngresoRepository {
  create(crear: Ingreso): Promise<void>;
  obtenerPagosPorReservaId(id: number): Promise<DetallePagosCliente[]>;
  eliminarPago(
    pagoId: number,
    usuarioId: number,
  ): Promise<{ success: boolean }>;
}
