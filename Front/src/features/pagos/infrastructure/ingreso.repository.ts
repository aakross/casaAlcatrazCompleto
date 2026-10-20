import { apiClient } from "../../../core/api/apiClient";
import {
  type IIngresoClientRepository,
  type IngresoApiData,
} from "../domain/ingreso.repository";

// Re-exportamos para compatibilidad con los hooks existentes
export type { IngresoApiData as IngresoApiResponse };

export class ApiIngresoRepository implements IIngresoClientRepository {
  async getByReservaId(id: number): Promise<IngresoApiData[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: IngresoApiData[];
      }>(`/ingresos/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener los detalles de ingresos",
      );
    }
  }

  // usuarioId se recibe como parámetro — el repositorio no accede al store de UI
  async delete(pagoId: number, usuarioId: number): Promise<void> {
    try {
      await apiClient.delete(`/ingresos/pago/${pagoId}`, {
        data: { usuarioId },
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          "Error al intentar eliminar el abono de caja.",
      );
    }
  }
}

// Singleton exportado para compatibilidad con los hooks existentes
export const IngresoRepository = new ApiIngresoRepository();
