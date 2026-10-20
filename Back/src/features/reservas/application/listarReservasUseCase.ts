import {
  IReservaRepository,
  ListarReservasResponse,
} from "../domain/reservas.respository";

export class ListarReservasUseCase {
  constructor(private reservaRepository: IReservaRepository) {}

  async execute(): Promise<ListarReservasResponse> {
    const reservas = await this.reservaRepository.findAll();

    return {
      success: true,
      data: reservas,
    };
  }
}
