import { IEstadoResultadosRepository } from "../domain/estado-resultados.repository";

export class ObtenerConceptosExtrasUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(): Promise<{ success: boolean; data: string[] }> {
    const data = await this.repository.obtenerConceptosExtras();
    return {
      success: true,
      data,
    };
  }
}
