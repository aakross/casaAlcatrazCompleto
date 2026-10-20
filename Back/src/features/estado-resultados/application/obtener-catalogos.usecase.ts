import {
  EgresoCategoria,
  EgresoConcepto,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export interface CatalogosEgresosResponse {
  categorias: EgresoCategoria[];
  conceptos: EgresoConcepto[];
}

export class ObtenerCatalogosEgresosUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(): Promise<{ success: boolean; data: CatalogosEgresosResponse }> {
    const [categorias, conceptos] = await Promise.all([
      this.repository.obtenerCategorias(),
      this.repository.obtenerConceptos(),
    ]);

    return {
      success: true,
      data: {
        categorias,
        conceptos,
      },
    };
  }
}
