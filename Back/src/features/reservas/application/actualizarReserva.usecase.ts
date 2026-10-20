import {
  IReservaRepository,
  ActualizarReservaInput,
} from "../domain/reservas.respository";

export interface ActualizarReservaResponse {
  success: boolean;
  message: string;
}

export interface ActualizarReservaCommand {
  reservacionId: number;
  fechaInicio: Date;
  fechaFin: Date;
  totalDiasReservacion: number;
  precioNoche: number;
  personasHospedadas: number;
  usuarioId: number;
  extras?: any[];
  nombreHuesped?: string | null;
  apellidoHuesped?: string | null;
  telefono?: string | null;
  origenReservaId?: number;
}

export class ActualizarReservaUseCase {
  constructor(private reservaRepository: IReservaRepository) {}

  async execute(
    command: ActualizarReservaCommand,
  ): Promise<ActualizarReservaResponse> {
    if (!command.usuarioId || command.usuarioId <= 0 || isNaN(command.usuarioId)) {
      throw new Error(
        "El ID del usuario que realiza la actualización es obligatorio.",
      );
    }
    if (command.totalDiasReservacion <= 0) {
      throw new Error(
        "El total de días de la reservación debe ser mayor a cero.",
      );
    }
    if (command.precioNoche <= 0) {
      throw new Error("El precio por noche debe ser mayor a cero.");
    }

    const nuevoMontoTotalHospedaje =
      command.totalDiasReservacion * command.precioNoche;

    // 🆕 PROCESAR Y RECALCULAR LOS EXTRAS EN LA ACTUALIZACIÓN
    const extrasProcesados = (command.extras || []).map((extra) => {
      const subtotalExtra =
        (Number(extra.cantidad) || 1) *
        (Number(extra.dias) || 1) *
        (Number(extra.precioUnitarioNoche) || 0);

      let porcComisionExtra = 0;
      let montoComisionExtra = 0;

      const conceptoStr = extra.concepto
        ? String(extra.concepto).toLowerCase().trim()
        : "";

      const esJardin = conceptoStr === "jardin" || conceptoStr === "jardín";

      if (esJardin) {
        porcComisionExtra =
          Number(extra.comision) || Number(extra.porcentajeComision) || 0;
        montoComisionExtra = (subtotalExtra * porcComisionExtra) / 100;
      }

      const itemMapeado = {
        concepto: extra.concepto,
        tipoEvento: esJardin ? String(extra.tipoEvento || "").trim() : "",
        cantidad: Number(extra.cantidad) || 1,
        dias: Number(extra.dias) || 1,
        precioUnitarioNoche: Number(extra.precioUnitarioNoche) || 0,
        monto: esJardin ? subtotalExtra - montoComisionExtra : subtotalExtra,
        porcentajeComision: porcComisionExtra,
        montoComision: montoComisionExtra,
      };

      return itemMapeado;
    });

    const inputRepositorio: ActualizarReservaInput = {
      reservacionId: Number(command.reservacionId),
      fechaInicio: command.fechaInicio,
      fechaFin: command.fechaFin,
      totalDiasReservacion: Number(command.totalDiasReservacion),
      precioNoche: Number(command.precioNoche),
      montoTotal: nuevoMontoTotalHospedaje,
      personasHospedadas: Number(command.personasHospedadas),
      usuarioId: Number(command.usuarioId),
      extras: extrasProcesados, // 🆕 Inyectamos los extras recalculados con sus montos y comisiones reales
      nombreHuesped: command.nombreHuesped,
      apellidoHuesped: command.apellidoHuesped,
      telefono: command.telefono,
      origenReservaId: command.origenReservaId || 1, // Valor por defecto si no se proporciona
    };

    await this.reservaRepository.actualizarReserva(inputRepositorio);

    return {
      success: true,
      message:
        "Reservación actualizada correctamente. Los montos globales han sido recalculados.",
    };
  }
}
