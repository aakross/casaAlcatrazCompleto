import { IIngresoRepository } from "../domain/crearIngreso.repository"; 

export interface EliminarPagoCommand {
  pagoId: number;
  usuarioId: number;
}

export class EliminarPagoUseCase {
  constructor(private ingresoRepository: IIngresoRepository) {}

  async execute(command: EliminarPagoCommand): Promise<{ success: boolean; message: string }> {
    if (!command.pagoId || command.pagoId <= 0) {
      throw new Error("El ID del abono a eliminar no es válido.");
    }
    if (!command.usuarioId || command.usuarioId <= 0) {
      throw new Error("El ID del usuario operador es obligatorio.");
    }

    await this.ingresoRepository.eliminarPago(command.pagoId, command.usuarioId);

    return {
      success: true,
      message: "El abono ha sido eliminado de caja y el balance fue actualizado con éxito.",
    };
  }
}
