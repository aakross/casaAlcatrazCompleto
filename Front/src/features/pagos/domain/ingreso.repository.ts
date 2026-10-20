// Contrato de dominio del repositorio de ingresos/pagos en el cliente.

export interface IngresoApiData {
  id: number;
  folioReserva: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  fechaInicio: string;
  fechaFin: string;
  estadoReservacion: string;
  conceptoDePagoId: number;
  conceptoPago: string;
  montoTotalReserva: number;
  montoBrutoPago: number;
  aplicaComisionPago: boolean;
  montoComisionPago: number;
  montoNetoPago: number;
  fechaRegistroPago: string;
  fechaDeposito: string;
}

export interface IIngresoClientRepository {
  getByReservaId(id: number): Promise<IngresoApiData[]>;
  delete(pagoId: number, usuarioId: number): Promise<void>;
}
