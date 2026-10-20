import {
  IIngresoRepository,
  DetallePagosCliente,
} from "../domain/crearIngreso.repository";

export interface BuscarPagosPorReservaResponse {
  success: boolean;
  data: DetallePagosCliente[];
}

export class BuscarPagosPorReservaUseCase {
  constructor(private ingresoRepository: IIngresoRepository) {}

  async execute(reservacionId: number): Promise<BuscarPagosPorReservaResponse> {
    if (!reservacionId || isNaN(reservacionId)) {
      throw new Error("El ID de la reservación proporcionado no es válido");
    }
    const historialPagos =
      await this.ingresoRepository.obtenerPagosPorReservaId(reservacionId);
    return {
      success: true,
      data: historialPagos,
    };
  }
}
