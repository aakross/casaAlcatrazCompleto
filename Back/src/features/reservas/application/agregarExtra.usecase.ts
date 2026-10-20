import {
  IReservaRepository,
  AgregarExtraInput,
} from "../domain/reservas.respository"; // Ajusta la ruta según tu estructura

export interface AgregarExtraResponse {
  success: boolean;
  message: string;
  data?: {
    montoCalculado: number;
  };
}

export class AgregarExtraUseCase {
  constructor(private reservaRepository: IReservaRepository) {}

  async execute(input: AgregarExtraInput): Promise<AgregarExtraResponse> {
    if (
      input.cantidad <= 0 ||
      input.dias <= 0 ||
      input.precioUnitarioNoche <= 0
    ) {
      throw new Error(
        "La cantidad, días y precio unitario del extra deben ser mayores a cero.",
      );
    }
    const resultado = await this.reservaRepository.agregarExtra({
      reservacionId: Number(input.reservacionId),
      concepto: input.concepto.trim(),
      cantidad: Number(input.cantidad),
      dias: Number(input.dias),
      precioUnitarioNoche: Number(input.precioUnitarioNoche),
      usuarioId: Number(input.usuarioId),
    });
    return {
      success: true,
      message:
        "Extra agregado exitosamente y monto neto de la reserva actualizado.",
      data: {
        montoCalculado: resultado.montoCalculado,
      },
    };
  }
}
