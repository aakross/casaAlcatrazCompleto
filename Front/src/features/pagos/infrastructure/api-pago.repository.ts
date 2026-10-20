import { apiClient } from "../../../core/api/apiClient";
import { type IPagoRepository, type Pago } from "../domain/pago.repository";

export class ApiPagoRepository implements IPagoRepository {
  async registrar(pago: Pago): Promise<void> {
    // Mapeamos el DTO de la aplicación a lo que requiere exactamente tu backend
    const payload = {
      origenDineroId: pago.origenDineroId,
      reservacionId: pago.reservacionId,
      conceptoPagoId: pago.conceptoPagoId,
      montoBruto: pago.montoBruto,
      aplicaComision: pago.aplicaComision,
      montoComision: pago.montoComision,
      userCreate: pago.userCreate,
      fechaDeposito: pago.fechaDeposito,
    };

    await apiClient.post("/ingresos/crear-ingreso", payload);
  }
}
