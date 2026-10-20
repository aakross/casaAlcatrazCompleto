import { apiClient } from "../../../core/api/apiClient";
import {
  type BitacoraItem,
  type IBitacoraRepository,
} from "../domain/bitacora.repository";

export class ApiBitacoraRepository implements IBitacoraRepository {
  async obtenerBitacora(): Promise<BitacoraItem[]> {
    const respuesta = await apiClient.get<{
      success: boolean;
      data: BitacoraItem[];
      error?: string;
    }>("/reportes/bitacora-borrados");

    if (respuesta.data && respuesta.data.success) {
      return respuesta.data.data || [];
    } else {
      throw new Error(
        respuesta.data?.error || "Error al procesar los datos de auditoría.",
      );
    }
  }
}

export const bitacoraRepository = new ApiBitacoraRepository();
