import { IReservaRepository, Reserva } from "../domain/reservas.respository";

// 1. Cambiamos el nombre a la interfaz de respuesta (sin la "I" de interfaz genérica)
export interface BuscarReservaPorIdResponse {
  success: boolean;
  data: Reserva;
}

// 2. Cambiamos el nombre de la clase para que coincida con tu ruteador
export class BuscarReservaPorIdUseCase {
  constructor(private reservaRepository: IReservaRepository) {}

  async execute(id: number): Promise<BuscarReservaPorIdResponse> {
    const reserva = await this.reservaRepository.findById(id);

    if (!reserva) {
      throw new Error("La reserva solicitada no existe");
    }

    return {
      success: true,
      data: reserva,
    };
  }
}
