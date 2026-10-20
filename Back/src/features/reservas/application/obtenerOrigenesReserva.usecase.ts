import {
  IOrigenesReserva,
  OrigenesReserva,
} from "../domain/origenReservas.repository";

interface ObtenerOrigenesResponse {
  success: boolean;
  data: OrigenesReserva[];
}

export class ObtenerOrigenesReservaUseCase {
  constructor(private origenesReservaRepository: IOrigenesReserva) {}

  async execute(): Promise<ObtenerOrigenesResponse> {
    const origenesReservas = await this.origenesReservaRepository.findAll();
    return {
      success: true,
      data: origenesReservas,
    };
  }
}
