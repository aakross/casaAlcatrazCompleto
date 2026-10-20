// Contratos de dominio del repositorio de reservaciones en el cliente.
// Las implementaciones concretas viven en la capa de infraestructura.

export interface ReservaApiData {
  id: number;
  nombreCliente: string;
  apellidoCliente: string;
  telefono: string | null;
  email: string | null;
  fechaInicio: string;
  fechaFin: string;
  estadoDescripcion: string;
  origenNombre: string;
  montoTotal: number;
  totalDiasReservacion: number;
  personasHospedadas: number;
  montoPagado: number;
  saldoPendiente: number;
  estatusPago: string;
  precioNoche: number;
  porcentajeComision: number;
  montoGarantia: number;
  origenReservaId: number;
  totalExtras: number;
  granTotalEstancia: number;
}

export interface IReservaClientRepository {
  create(formData: any, usuarioId?: number): Promise<void>;
  getAll(): Promise<ReservaApiData[]>;
  getById(id: number): Promise<any>;
  update(id: number, formData: any, usuarioId?: number): Promise<void>;
  delete(id: number, usuarioId?: number): Promise<void>;
}
