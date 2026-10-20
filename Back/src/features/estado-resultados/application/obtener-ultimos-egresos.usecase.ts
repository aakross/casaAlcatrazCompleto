import { IEstadoResultadosRepository } from "../domain/estado-resultados.repository";

export class ObtenerUltimosEgresosUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(
    limite = 10,
  ): Promise<{ success: boolean; data: any[] }> {
    const data = await this.repository.obtenerUltimosEgresos(limite);
    return {
      success: true,
      data,
    };
  }
}
