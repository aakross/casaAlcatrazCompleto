import {
  ExtraDetalleItem,
  FiltrosDetalleExtrasInput,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export class ObtenerDetalleExtrasUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(
    filtros: FiltrosDetalleExtrasInput,
  ): Promise<{ success: boolean; data: ExtraDetalleItem[] }> {
    const data = await this.repository.obtenerDetalleExtras(filtros);
    return {
      success: true,
      data,
    };
  }
}
