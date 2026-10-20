import {
  EgresoDetalleItem,
  FiltrosDetalleEgresosInput,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export class ObtenerDetalleEgresosUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(
    filtros: FiltrosDetalleEgresosInput,
  ): Promise<{ success: boolean; data: EgresoDetalleItem[] }> {
    const data = await this.repository.obtenerDetalleEgresos(filtros);
    return {
      success: true,
      data,
    };
  }
}
