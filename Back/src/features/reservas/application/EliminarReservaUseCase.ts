import { IReservaRepository } from "../domain/reservas.respository";

// Define el contrato de entrada para el caso de uso
export interface EliminarReservaCommand {
  reservacionId: number;
  usuarioId: number;
}

export interface EliminarReservaResponse {
  success: boolean;
  message: string;
}

export class EliminarReservaUseCase {
  // Recibe la interfaz del repositorio por inversión de dependencias
  constructor(private reservaRepository: IReservaRepository) {}

  async execute(
    command: EliminarReservaCommand,
  ): Promise<EliminarReservaResponse> {
    if (!command.reservacionId || command.reservacionId <= 0) {
      throw new Error("El ID de la reservación a eliminar no es válido.");
    }
    if (!command.usuarioId || command.usuarioId <= 0) {
      throw new Error(
        "El ID del usuario que solicita la eliminación es obligatorio.",
      );
    }

    // Llama al repositorio que conectará con el Stored Procedure de SQL Server
    const resultado = await this.reservaRepository.eliminar(
      command.reservacionId,
      command.usuarioId,
    );

    return {
      success: true,
      message:
        "La reservación y todo su rastro financiero (pagos y extras) fueron eliminados permanentemente del sistema.",
    };
  }
}
