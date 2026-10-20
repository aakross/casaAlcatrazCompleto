import {
  RegistrarProvisionIsrInput,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export class RegistrarProvisionIsrUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(input: RegistrarProvisionIsrInput): Promise<{
    success: boolean;
    data: { id: number };
    message: string;
  }> {
    if (input.monto === undefined || input.monto === null || Number(input.monto) < 0) {
      throw new Error("El monto de provisión de ISR no puede ser negativo.");
    }

    if (!input.fechaProvision) {
      throw new Error("La fecha de provisión es obligatoria.");
    }

    const fecha = new Date(input.fechaProvision);
    const ejercicioAno = input.ejercicioAno || fecha.getFullYear();
    const periodoMes = input.periodoMes || fecha.getMonth() + 1;

    const resultado = await this.repository.registrarProvisionIsr({
      fechaProvision: fecha,
      ejercicioAno: Number(ejercicioAno),
      periodoMes: Number(periodoMes),
      monto: Number(input.monto),
      observaciones: input.observaciones ? String(input.observaciones).trim() : null,
      usuarioId: Number(input.usuarioId || 1),
    });

    return {
      success: true,
      data: { id: resultado.id },
      message: resultado.message,
    };
  }
}
