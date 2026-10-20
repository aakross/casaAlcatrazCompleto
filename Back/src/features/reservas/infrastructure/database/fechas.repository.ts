import mssql from "mssql";
import { dbConfig } from "../../../../config/database";
import { IFechasOcupadas, IFechasOcupadasRepository } from "../../domain/fechas.repository";



export class FechasOcupadasRepository implements IFechasOcupadasRepository {
  async obtenerFechasOcupadas(): Promise<IFechasOcupadas[]> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      const result = await pool.request().query(`
        SELECT 
          r.fecha_inicio AS fechaDesde,
          r.fecha_fin AS fechaHasta,
          (ISNULL(c.nombre, '') + ' ' + ISNULL(c.apellido, '')) AS nombreCliente,
          o.nombre AS plataformaOrigen
        FROM 
          AAC_Alcatraz_reservaciones r
        INNER JOIN 
          AAC_Alcatraz_clientes c ON r.cliente_id = c.id
        INNER JOIN 
          AAC_Alcatraz_origen_reserva o ON r.origen_reserva_id = o.id
        ORDER BY 
          r.fecha_inicio ASC;
      `);

      return result.recordset.map((row) => ({
        fechaDesde: row.fechaDesde,
        fechaHasta: row.fechaHasta,
        nombreCliente: row.nombreCliente,
        plataformaOrigen: row.plataformaOrigen,
      }));
    } catch (error) {
      throw new Error(`Error al obtener fechas ocupadas: ${(error as Error).message}`);
    }
  }
}