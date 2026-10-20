// src/features/reservas/infrastructure/api-fechas-ocupadas.repository.ts
import { apiClient } from "../../../core/api/apiClient";
import { type FechasOcupadas } from "../domain/fechas-ocupadas.repository";
import { type IFechasOcupadasRepository } from "../domain/fechas-ocupadas.repository";

export class ApiFechasOcupadasRepository implements IFechasOcupadasRepository {
  async obtenerOcupadas(): Promise<FechasOcupadas[]> {
    const { data } = await apiClient.get<any[]>("/reservas/ocupadas");

    return data.map((item) => {
      // 1. Cortamos los primeros 10 caracteres para deshacernos del "T00:00:00.000Z"
      const fechaDesdeLimpia = item.fechaDesde.substring(0, 10);
      const fechaHastaLimpia = item.fechaHasta.substring(0, 10);

      // 2. Ahora el split funcionará perfecto separando números limpios
      const [anoD, mesD, diaD] = fechaDesdeLimpia.split("-").map(Number);
      const [anoH, mesH, diaH] = fechaHastaLimpia.split("-").map(Number);

      // 3. Creamos las fechas puras locales (restando 1 al mes porque en JS Enero es 0)
      return {
        fechaDesde: new Date(anoD, mesD - 1, diaD),
        fechaHasta: new Date(anoH, mesH - 1, diaH),
        nombreCliente: item.nombreCliente,
        plataformaOrigen: item.plataformaOrigen.trim(), // Aprovechamos de limpiar los espacios vacíos
      };
    });
  }
}
