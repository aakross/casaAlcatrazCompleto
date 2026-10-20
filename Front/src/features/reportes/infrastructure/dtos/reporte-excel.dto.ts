import { type FilaReporteFinanciero } from "../../domain/reportes.repository";

export class ReporteExcelDto {
  static toExcelRows(filas: FilaReporteFinanciero[]) {
    return filas.map((fila) => ({
      Folio: `#${fila.numeroReserva}`,
      "Huésped / Cliente": fila.cliente,
      "Fecha Inicio": fila.fechaInicio.split("T")[0],
      "Fecha Fin": fila.fechaFin.split("T")[0],
      "Precio x Noche": fila.costoPorNoche,
      "Hospedaje Bruto": fila.costoTotalReservacion,
      "Comisión":
        fila.montoComisionPlataforma > 0 ? -fila.montoComisionPlataforma : 0,
      "Servicios Extras": fila.serviciosExtras,
      "Total Estancia (Neto)": fila.totalEstancia,
      "Monto Abonado": fila.pagosRecibidos,
      "Saldo Pendiente":
        fila.montoPendientePago <= 0 ? 0 : fila.montoPendientePago,
      "Depósito Garantía": fila.depositoGarantia,
      "Estatus Histórico": fila.estatus,
    }));
  }
}
