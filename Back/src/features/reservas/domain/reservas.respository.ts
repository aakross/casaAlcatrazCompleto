export interface Reserva {
  id: number; // Mapea a FolioReserva
  nombreCliente: string; // Mapea a nombre
  apellidoCliente: string; // Mapea a apellido
  telefono?: string;
  email?: string;
  fechaInicio: Date; // Mapea a fecha_inicio
  fechaFin: Date; // Mapea a fecha_fin
  estadoDescripcion: string; // Mapea a la descripcion del estado
  origenNombre: string; // Mapea al nombre del origen
  montoTotal: number; // Mapea a monto_total
  totalDiasReservacion: number; // Mapea a total_dias_reservados
  personasHospedadas: number; // Mapea a personas_hospedadas
  montoPagado?: number;
  saldoPendiente?: number;
  estatusPago?: string;
  diasParaCheckIn?: number;
  porcentajeComision: number; // Mapea a porcentajeComision (ej. 10.00)
  montoComision: number; // Mapea a montoComision (Monto retenido)
  gananciaNeto: number;
  origenReservaId: number;
  precioNoche: number;
  montoGarantia: number;
  extras?: Array<{
    id: number;
    concepto: string;
    tipoEvento?: string;
    cantidad: number;
    dias: number;
    precioUnitarioNoche: number;
    monto: number;
    porcentajeComision?: number;
    montoComision?: number;
  }>;
  totalExtras: number;
  granTotalEstancia: number;
}

export interface ReservacionExtra {
  concepto: string;
  tipoEvento?: string;
  monto: number;
  precioUnitarioNoche: number;
  cantidad: number;
  dias: number;
  porcentajeComision?: number;
  montoComision?: number;
}

export interface CrearReservaInput {
  usuarioId: number; // @IdUsuario
  nombreCliente: string; // @NombreCliente
  apellidoCliente: string; // @ApellidoCliente
  telefono: string; // @Telefono
  email?: string; // @Email
  fechaInicio: Date; // @FechaInicio
  fechaFin: Date; // @FechaFin
  totalDiasReservacion: number; // @TotalDiasReservados
  montoTotal: number; // @MontoTotal
  nuevoOrigenNombre?: string;
  origenReservaId: number; // @OrigenReservaId
  personasHospedadas: number; // @PersonasHospedadas
  extras?: ReservacionExtra[];
  precioNoche: number;
  porcentajeComision: number;
  montoGarantia: number;
}

export interface AgregarExtraInput {
  reservacionId: number;
  concepto: string;
  cantidad: number;
  dias: number;
  precioUnitarioNoche: number;
  usuarioId: number;
}

export interface ActualizarReservaInput {
  reservacionId: number;
  fechaInicio: Date;
  fechaFin: Date;
  totalDiasReservacion: number;
  precioNoche: number;
  montoTotal: number;
  personasHospedadas: number;
  usuarioId: number;
  extras?: Array<{
    id?: number;
    concepto: string;
    tipoEvento?: string;
    cantidad: number;
    dias: number;
    precioUnitarioNoche: number;
    monto: number;
    porcentajeComision?: number;
    montoComision?: number;
  }>;
  nombreHuesped?: string | null;
  apellidoHuesped?: string | null;
  telefono?: string | null;
  origenReservaId: number;
}

export interface IReservaRepository {
  findById(id: number): Promise<Reserva | null>;
  findAll(): Promise<Reserva[]>;
  create(
    reserva: CrearReservaInput,
  ): Promise<{ id: number } & CrearReservaInput>;
  agregarExtra(
    input: AgregarExtraInput,
  ): Promise<{ success: boolean; montoCalculado: number }>;
  actualizarReserva(
    input: ActualizarReservaInput,
  ): Promise<{ success: boolean }>;
  eliminar(id: number, usuarioId: number): Promise<{ success: boolean }>;
}

export interface ListarReservasResponse {
  success: boolean;
  data: Reserva[];
}
