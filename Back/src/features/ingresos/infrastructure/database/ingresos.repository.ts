import mssql from "mssql";
import {
  DetallePagosCliente,
  IIngresoRepository,
  Ingreso,
} from "../../domain/crearIngreso.repository";
import { dbConfig } from "../../../../config/database";

export class IngresosRepository implements IIngresoRepository {
  async create(crear: Ingreso): Promise<void> {
    let pool;

    try {
      pool = await mssql.connect(dbConfig);

      const result = await pool
        .request()
        .input("origen_dinero_id", mssql.Int, crear.origenDineroId)
        .input("reservacion_id", mssql.Int, crear.reservacionId)
        .input("concepto_pago_id", mssql.Int, crear.conceptoPagoId)
        .input("monto_bruto", mssql.Decimal(10, 2), crear.montoBruto)
        .input("aplica_comision", mssql.Bit, crear.aplicaComision ? 1 : 0)
        .input("monto_comision", mssql.Decimal(10, 2), crear.montoComision)
        .input("user_create", mssql.Int, crear.userCreate)
        .input("fecha_deposito", mssql.Date, crear.fechaDeposito)
        .execute("dbo.AAC_Alcatraz_AgregarPagoYFinalizarReserva");
    } catch (error) {
      throw new Error(
        `Error al registrar el pago en la BD: ${(error as Error).message}`,
      );
    }
  }
  async obtenerPagosPorReservaId(id: number): Promise<DetallePagosCliente[]> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      const result = await pool.request().input("id", mssql.Int, id).query(`
        SELECT
          pagos.id AS pagoId,
          res.id AS FolioReserva,
          cli.nombre, 
          cli.apellido, 
          cli.telefono,
          cli.email,
          res.fecha_inicio, 
          res.fecha_fin,
          est.descripcion AS EstadoReservacion,
          con.id AS conceptoDePagoId,
          con.descripcion AS ConceptoPago,
          res.monto_total, 
          pagos.monto_bruto, 
          pagos.aplica_comision, 
          pagos.monto_comision,
          pagos.monto_neto,
          pagos.created_at AS PagoRegistradoEl,
          pagos.fecha_deposito AS FechaDeposito
        FROM AAC_Alcatraz_reservaciones res
          JOIN AAC_Alcatraz_clientes cli ON cli.id = res.cliente_id
          JOIN AAC_Alcatraz_estado_reservacion est ON est.id = res.estado_reservacion_id
          LEFT JOIN AAC_Alcatraz_pagos_cliente pagos ON pagos.reservacion_id = res.id
          LEFT JOIN AAC_Alcatraz_concepto_pago con ON con.id = pagos.concepto_pago_id
        WHERE res.id = @id
        ORDER BY pagos.id DESC
      `);

      return result.recordset.map((row) => ({
        id: row.pagoId ? Number(row.pagoId) : 0,
        folioReserva: Number(row.FolioReserva),
        nombre: row.nombre,
        apellido: row.apellido,
        telefono: row.telefono,
        email: row.email,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        estadoReservacion: row.EstadoReservacion,
        conceptoDePagoId: Number(row.conceptoDePagoId),
        conceptoPago: row.ConceptoPago ? row.ConceptoPago.trim() : "",
        montoTotalReserva: Number(row.monto_total),
        montoBrutoPago: Number(row.monto_bruto),
        aplicaComisionPago:
          row.aplica_comision === 1 || row.aplica_comision === true,
        montoComisionPago: Number(row.monto_comision),
        montoNetoPago: Number(row.monto_neto),
        fechaRegistroPago: row.PagoRegistradoEl,
        fechaDeposito: row.FechaDeposito,
      }));
    } catch (error) {
      throw new Error(
        `Error al obtener el historial de pagos: ${(error as Error).message}`,
      );
    }
  }
  async eliminarPago(
    pagoId: number,
    usuarioId: number,
  ): Promise<{ success: boolean }> {
    let pool;
    try {
      if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
        throw new Error("[Repository] IdUsuario no válido para eliminar el abono.");
      }
      pool = await mssql.connect(dbConfig);
      await pool
        .request()
        .input("PagoId", mssql.Int, Number(pagoId))
        .input("IdUsuario", mssql.Int, Number(usuarioId))
        .execute("dbo.AAC_Alcatraz_Eliminar_Pago_Cliente");

      return { success: true };
    } catch (error) {
      throw new Error(
        `Error al eliminar el abono en la BD: ${(error as Error).message}`,
      );
    }
  }
}
