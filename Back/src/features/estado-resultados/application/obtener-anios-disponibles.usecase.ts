import { IEstadoResultadosRepository } from "../domain/estado-resultados.repository";

export class ObtenerAniosDisponiblesUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(): Promise<{ success: boolean; data: number[] }> {
    const anios = await this.repository.obtenerAniosDisponibles();

    // Aseguramos que al menos esté el año en curso si la base de datos estuviera vacía
    const anioActual = new Date().getFullYear();
    const listaFinal = anios.length > 0 ? anios : [anioActual];

    return {
      success: true,
      data: listaFinal,
    };
  }
}
