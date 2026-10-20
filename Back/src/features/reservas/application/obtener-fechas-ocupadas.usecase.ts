// src/features/reservas/application/obtener-fechas-ocupadas.usecase.ts
import {
  IFechasOcupadasRepository,
  IFechasOcupadas,
} from "../domain/fechas.repository";

export class ObtenerFechasOcupadasUseCase {
  constructor(private fechasRepository: IFechasOcupadasRepository) {}

  async execute(): Promise<IFechasOcupadas[]> {
    return await this.fechasRepository.obtenerFechasOcupadas();
  }
}
