import {
  ActualizarEgresoInput,
  IEstadoResultadosRepository,
} from "../domain/estado-resultados.repository";

export class ActualizarEgresoUseCase {
  constructor(private readonly repository: IEstadoResultadosRepository) {}

  async execute(input: ActualizarEgresoInput): Promise<{
    success: boolean;
    data: { id: number };
    message: string;
  }> {
    if (!input.id || isNaN(Number(input.id)) || Number(input.id) <= 0) {
      throw new Error("El ID del egreso a actualizar es obligatorio y debe ser válido.");
    }

    if (!input.conceptoId || isNaN(Number(input.conceptoId)) || Number(input.conceptoId) <= 0) {
      throw new Error("Debe seleccionar un concepto de gasto válido.");
    }

    if (input.monto === undefined || isNaN(Number(input.monto)) || Number(input.monto) <= 0) {
      throw new Error("El monto del gasto debe ser un número mayor a 0.");
    }

    if (!input.fechaGasto) {
      throw new Error("La fecha del gasto es obligatoria.");
    }

    // Validación de negocio: solo se permite registrar/actualizar desde la fecha de hoy hacia atrás
    let fechaGastoStr: string;
    if (typeof input.fechaGasto === "string") {
      fechaGastoStr = (input.fechaGasto as string).trim().split("T")[0];
    } else if (input.fechaGasto instanceof Date) {
      const d = input.fechaGasto;
      const anio = d.getUTCFullYear();
      const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(d.getUTCDate()).padStart(2, "0");
      fechaGastoStr = `${anio}-${mes}-${dia}`;
    } else {
      fechaGastoStr = String(input.fechaGasto);
    }

    const hoyMexico = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (fechaGastoStr > hoyMexico) {
      throw new Error("No se pueden actualizar egresos con fechas futuras. Solo se permite la fecha actual o anterior.");
    }

    const desc = (input.descripcion || "").trim();
    if (!desc) {
      throw new Error("La descripción del gasto es obligatoria.");
    }

    if (!input.usuarioId || isNaN(Number(input.usuarioId)) || Number(input.usuarioId) <= 0) {
      throw new Error("El ID del usuario que realiza la edición es obligatorio.");
    }

    const resultado = await this.repository.actualizarEgreso({
      id: Number(input.id),
      conceptoId: Number(input.conceptoId),
      monto: Number(input.monto),
      fechaGasto: new Date(input.fechaGasto),
      referenciaComprobante: input.referenciaComprobante
        ? String(input.referenciaComprobante).trim()
        : null,
      descripcion: desc,
      origenDineroId: input.origenDineroId ? Number(input.origenDineroId) : null,
      usuarioId: Number(input.usuarioId),
      usuarioNombre: input.usuarioNombre ? String(input.usuarioNombre).trim() : null,
    });

    return {
      success: true,
      data: { id: resultado.id },
      message: resultado.message,
    };
  }
}
