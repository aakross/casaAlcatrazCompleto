import { IIngresoRepository, Ingreso } from "../domain/crearIngreso.repository";

export interface CrearIngresoResponse {
  success: boolean;
  message: string;
}

export class CrearIngresoUsecase {
  constructor(private ingresoRepository: IIngresoRepository) {}

  async execute(input: Ingreso): Promise<CrearIngresoResponse> {
    if (input.montoBruto <= 0) {
      throw new Error("El monto bruto del pago debe ser mayor a 0");
    }

    if (input.aplicaComision && input.montoComision <= 0) {
      throw new Error(
        "Si aplica comisión, el monto de la comisión no puede ser 0",
      );
    }

    await this.ingresoRepository.create(input);

    return {
      success: true,
      message: "El pago a sido registrado correctamente",
    };
  }
}
