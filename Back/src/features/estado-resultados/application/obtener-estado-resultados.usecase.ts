import {
  FiltrosEstadoResultadosInput,
  EstadoResultadosResponse,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export class ObtenerEstadoResultadosUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(
    filtros: FiltrosEstadoResultadosInput,
  ): Promise<{ success: boolean; data: EstadoResultadosResponse }> {
    // Si viene año numérico y no se indicaron fechas, armamos el rango del año correspondiente
    let fechaDesde = filtros.fechaDesde;
    let fechaHasta = filtros.fechaHasta;

    if (filtros.anio && !fechaDesde && !fechaHasta) {
      fechaDesde = `${filtros.anio}-01-01`;
      fechaHasta = `${filtros.anio}-12-31`;
    }

    const resultado = await this.repository.obtenerEstadoResultados({
      ...filtros,
      fechaDesde,
      fechaHasta,
    });

    return {
      success: true,
      data: resultado,
    };
  }
}
