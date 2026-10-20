import mssql from "mssql";
import { dbConfig } from "../../../../config/database"; // Ajusta la ruta a tu config de BD
import {
  IOrigenesReserva,
  OrigenesReserva,
} from "../../domain/origenReservas.repository";

export class OrigenReservasRepository implements IOrigenesReserva {
  async findAll(): Promise<OrigenesReserva[]> {
    let pool;
    try {
      // Abrimos la conexión tal como lo haces en reservas
      pool = await mssql.connect(dbConfig);

      // Consulta directa a la tabla maestra de tu diagrama
      const result = await pool.request().query(`
        SELECT 
          id, 
          nombre, 
          descripcion 
        FROM AAC_Alcatraz_origen_reserva
        ORDER BY nombre ASC
      `);

      // Mapeamos los registros de la BD al contrato del Dominio
      return result.recordset.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion || "",
      }));
    } catch (error) {
      // Error controlado de infraestructura
      throw new Error(
        `Error al obtener los orígenes de reserva: ${(error as Error).message}`,
      );
    } finally {
      // Es una buena práctica cerrar o liberar el pool si tu arquitectura lo requiere
      // si en tu otro repositorio no lo cierras explícitamente, puedes omitir el finally
    }
  }
}
