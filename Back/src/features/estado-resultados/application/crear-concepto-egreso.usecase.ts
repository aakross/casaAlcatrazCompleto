import {
  CrearConceptoInput,
  EgresoConcepto,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export class CrearConceptoEgresoUseCase {
  constructor(private repository: IEstadoResultadosRepository) {}

  async execute(input: CrearConceptoInput): Promise<{
    success: boolean;
    data: EgresoConcepto;
    message: string;
  }> {
    if (!input.nombre || input.nombre.trim() === "") {
      throw new Error("El nombre del concepto es obligatorio.");
    }

    if (!input.categoriaId || isNaN(Number(input.categoriaId))) {
      throw new Error("Debe seleccionar una de las 4 categorías base.");
    }

    const conceptoCreado = await this.repository.crearConcepto({
      ...input,
      nombre: input.nombre.trim(),
      descripcion: input.descripcion ? input.descripcion.trim() : null,
      categoriaId: Number(input.categoriaId),
      usuarioId: Number(input.usuarioId || 1),
    });

    return {
      success: true,
      data: conceptoCreado,
      message: "Concepto registrado correctamente en el catálogo.",
    };
  }
}
