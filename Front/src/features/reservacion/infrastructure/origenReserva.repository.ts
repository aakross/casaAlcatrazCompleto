import { apiClient } from "../../../core/api/apiClient";
import {
  type IOrigenReservaRepository,
  type OrigenReserva,
} from "../domain/origenReserva.repository";

// Re-exportamos para compatibilidad con código existente que use OrigenReservaDTO
export type OrigenReservaDTO = OrigenReserva;

export class ApiOrigenReservaRepository implements IOrigenReservaRepository {
  async getAll(): Promise<OrigenReserva[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: OrigenReservaDTO[];
    }>("/reservas/origenes");
    // Aprovechamos para limpiar los espacios en blanco (trim) que vimos en Postman
    return response.data.data.map((item) => ({
      ...item,
      nombre: item.nombre.trim(),
      descripcion: item.descripcion.trim(),
    }));
  }
}

export const OrigenReservaRepository = new ApiOrigenReservaRepository();
