import { apiClient } from "../../../core/api/apiClient";
import { useAuthStore } from "../../../core/store/authStore";
import { type ReservaFormData } from "../domain/reserva.schema";
import {
  type IReservaClientRepository,
  type ReservaApiData,
} from "../domain/reserva.repository";

// Re-exportamos para compatibilidad con los hooks existentes que importan este tipo
export type { ReservaApiData as ReservaApiResponse };

export class ApiReservaRepository implements IReservaClientRepository {
  async create(formData: ReservaFormData, usuarioId?: number): Promise<void> {
    const esOtro = formData.origenReserva === "OTRO";
    const resolvedUserId = usuarioId ?? useAuthStore.getState().userId ?? 1;
    const apiPayload = {
      usuarioId: Number(resolvedUserId),
      nombreCliente: formData.nombreHuesped,
      apellidoCliente: formData.apellidoHuesped,
      telefono: formData.telefono || null,
      email: null,
      fechaInicio: formData.fechaEntrada,
      fechaFin: formData.fechaSalida,
      totalDiasReservacion: formData.diasHospedaje,
      montoTotal: formData.montoTotal,
      personasHospedadas: formData.huespedes,
      origenReservaId: esOtro ? "OTRO" : Number(formData.origenReserva),
      nuevoOrigenNombre: esOtro ? (formData as any).nuevoOrigenNombre : null,
      precioNoche: Number(formData.precioNoche || 0),
      porcentajeComision: Number(formData.porcentajeComision || 0),
      montoGarantia: Number(formData.montoGarantia || 0),
      extras: (formData.extras || []).map((ext) => ({
        concepto: ext.concepto,
        tipoEvento:
          ext.concepto === "Jardin"
            ? String((ext as any).tipoEvento || "").trim()
            : "",
        cantidad: Number(ext.cantidad || 1),
        dias: Number(ext.dias || 1),
        precioUnitarioNoche: Number(ext.precioUnitarioNoche || 0),
        monto: Number(ext.monto || 0),
        porcentajeComision: Number(ext.porcentajeComision || 0),
        montoComision: Number(ext.montoComision || 0),
      })),
    };

    try {
      const response = await apiClient.post("/reservas/crear-reserva", apiPayload);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            "Error al crear la reserva en el servidor",
        );
      } else if (error.request) {
        throw new Error(
          "No hay respuesta del servidor. Revisa tu conexión de red.",
        );
      } else {
        throw new Error(
          error.message || "Error inesperado al procesar el envío",
        );
      }
    }
  }

  async getAll(): Promise<ReservaApiData[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ReservaApiData[];
      }>("/reservas/todas");

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener el listado de reservas",
      );
    }
  }

  async getById(id: number): Promise<any> {
    try {
      const response = await apiClient.get(`/reservas/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.error ||
            "Error al cargar los detalles de la reserva",
        );
      } else {
        throw new Error("Error de conexión al buscar por ID");
      }
    }
  }

  async update(id: number, formData: ReservaFormData, usuarioId?: number): Promise<void> {
    const resolvedUserId = usuarioId ?? useAuthStore.getState().userId ?? 1;
    const apiPayload = {
      usuarioId: Number(resolvedUserId),
      fechaInicio: formData.fechaEntrada,
      fechaFin: formData.fechaSalida,
      totalDiasReservacion: formData.diasHospedaje,
      precioNoche: Number(formData.precioNoche || 0),
      personasHospedadas: formData.huespedes,
      nombreHuesped: formData.nombreHuesped,
      apellidoHuesped: formData.apellidoHuesped,
      telefono: formData.telefono || null,
      origenReservaId: Number(formData.origenReserva) || 1,
      extras: (formData.extras || []).map((ext) => ({
        concepto: ext.concepto,
        tipoEvento:
          ext.concepto === "Jardin"
            ? String((ext as any).tipoEvento || "").trim()
            : "",
        cantidad: Number(ext.cantidad || 1),
        dias: Number(ext.dias || 1),
        precioUnitarioNoche: Number(ext.precioUnitarioNoche || 0),
        monto: Number(ext.monto || 0),
        porcentajeComision: Number(ext.porcentajeComision || 0),
        montoComision: Number(ext.montoComision || 0),
      })),
    };

    try {
      const response = await apiClient.put(`/reservas/${id}/actualizar`, apiPayload);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.error ||
            "Error al actualizar la reserva en el servidor",
        );
      } else if (error.request) {
        throw new Error("No hay respuesta del servidor. Revisa tu conexión.");
      } else {
        throw new Error(error.message || "Error inesperado al actualizar");
      }
    }
  }

  async delete(id: number, usuarioId?: number): Promise<void> {
    const resolvedUserId = usuarioId ?? useAuthStore.getState().userId ?? 1;
    try {
      await apiClient.delete(`/reservas/${id}/eliminar`, {
        data: { usuarioId: Number(resolvedUserId) },
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          "Ocurrió un error inesperado al intentar eliminar la reservación.",
      );
    }
  }
}

// Singleton exportado para compatibilidad con todos los hooks existentes
export const ReservaRepository = new ApiReservaRepository();
