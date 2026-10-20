import mssql from "mssql";
import {
  DashboardCompletoResponse,
  IResumenRepository,
  ResumenGeneralResponse,
} from "../../domain/resumen.repository";
import { dbConfig } from "../../../../config/database";

export class ResumenRepository implements IResumenRepository {
  async obtenerResumenDashboard(): Promise<ResumenGeneralResponse> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      // Creamos la solicitud para la base de datos
      const request = pool.request();

      // Ejecutamos ambos queries en paralelo para máxima velocidad
      const [resultReservaciones, resultFinanzas] = await Promise.all([
        request.query(`
          SELECT 
            COUNT(*) AS TotalDeReservaciones, 
            SUM(monto_total) AS montoReservaciones 
          FROM AAC_Alcatraz_reservaciones
        `),
        request.query(`
          SELECT 
            SUM(monto_bruto) AS MontosBrutos, 
            SUM(monto_comision) AS Comisiones, 
            SUM(monto_neto) AS Total 
          FROM AAC_Alcatraz_pagos_cliente
        `),
      ]);

      // Extraemos la primera fila de cada resultado
      const filaReservaciones = resultReservaciones.recordset[0];
      const filaFinanzas = resultFinanzas.recordset[0];

      // Mapeamos los datos respetando los alias de tus queries hacia tu interfaz del Dominio
      return {
        reservaciones: {
          // Usamos Number() y || 0 por si la tabla está vacía y SQL devuelve NULL
          totalReservaciones: Number(
            filaReservaciones?.TotalDeReservaciones || 0,
          ),
          montoReservaciones: Number(
            filaReservaciones?.montoReservaciones || 0,
          ),
        },
        finanzas: {
          montosBrutos: Number(filaFinanzas?.MontosBrutos || 0),
          comisiones: Number(filaFinanzas?.Comisiones || 0),
          totalNeto: Number(filaFinanzas?.Total || 0),
        },
      };
    } catch (error) {
      // Lanzamos el error hacia arriba para que el controlador lo atrape en su catch
      throw new Error(
        `Error en la base de datos al generar el resumen: ${(error as Error).message}`,
      );
    }
  }
  async obtenerDashboardCompleto(): Promise<DashboardCompletoResponse> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      // Ejecutamos los 5 queries en paralelo con requests independientes para máxima velocidad
      // En tu reservas.repository.ts -> obtenerDashboardCompleto

      const [
        resFinanzas,
        resPlataformas,
        resHistorico,
        resTopClientes,
        resEstados,
      ] = await Promise.all([
        // 1. FINANZAS REALES COMPLETA (🆕 Añadimos lo proyectado en reservaciones vs lo cobrado en caja)
        pool.request().query(`
     SELECT 
    -- Caja Cobrada Real (Historial de abonos acumulados en bruto)
    ISNULL((SELECT SUM(monto_bruto) FROM AAC_Alcatraz_pagos_cliente), 0) AS [Total Bruto Cobrado],
    ISNULL((SELECT SUM(monto_neto) FROM AAC_Alcatraz_pagos_cliente), 0) AS [Total Neto Cobrado],
    ISNULL((SELECT SUM(monto_total) FROM AAC_Alcatraz_reservaciones), 0) AS [Hospedaje Proyectado],
    ISNULL((SELECT SUM(monto_comision) FROM AAC_Alcatraz_reservaciones), 0) AS [Total Comisiones],
    ISNULL((SELECT SUM(monto_neto) FROM AAC_Alcatraz_reservaciones), 0) AS [Utilidad Proyectada Libros]
  FROM (SELECT 1 AS dual) AS p;
  `),

        // 2. RENDIMIENTO DE PLATAFORMAS (🆕 Corregido: Suma el hospedaje base + todos sus extras reales)
        pool.request().query(`
    SELECT 
      o.nombre AS [Plataforma],
      COUNT(r.id) AS [Cantidad Reservaciones],
      SUM(r.monto_total + ISNULL(ext.subtotal_extras, 0.00)) AS [Total Dinero Generado]
    FROM AAC_Alcatraz_reservaciones r
    INNER JOIN AAC_Alcatraz_origen_reserva o ON r.origen_reserva_id = o.id
    LEFT JOIN (
        SELECT reservacion_id, SUM(monto) AS subtotal_extras
        FROM AAC_Alcatraz_reservacion_extras
        GROUP BY reservacion_id
    ) ext ON r.id = ext.reservacion_id
    GROUP BY o.nombre
    ORDER BY [Total Dinero Generado] DESC;
  `),

        // 3. ESTADÍSTICAS HISTÓRICAS GENERALES
        pool.request().query(`
    SELECT 
      COUNT(id) AS [Total Reservas Historicas],
      SUM(total_dias_reservados) AS [Total Dias Reservados],
      SUM(personas_hospedadas) AS [Total Huespedes Recibidos],
      AVG(CAST(total_dias_reservados AS DECIMAL(10,2))) AS [Promedio de Dias por Reserva]
    FROM AAC_Alcatraz_reservaciones;
  `),

        // 4. TOP 10 CLIENTES PREMIUM (🆕 Corregido: Suma hospedaje + extras y activa el contador de viajes)
        pool.request().query(`
    SELECT TOP 10
      c.nombre + ' ' + c.apellido AS [Cliente],
      ISNULL(c.email, 'Sin Correo') AS [Correo],
      COUNT(r.id) AS [Cantidad Viajes],
      SUM(r.monto_total + ISNULL(ext.subtotal_extras, 0.00)) AS [Total Dinero Gastado]
    FROM AAC_Alcatraz_clientes c
    INNER JOIN AAC_Alcatraz_reservaciones r ON c.id = r.cliente_id
    LEFT JOIN (
        SELECT reservacion_id, SUM(monto) AS subtotal_extras
        FROM AAC_Alcatraz_reservacion_extras
        GROUP BY reservacion_id
    ) ext ON r.id = ext.reservacion_id
    GROUP BY c.nombre, c.apellido, c.email
    ORDER BY [Total Dinero Gastado] DESC;
  `),

        // 5. ESTADO OPERATIVO DE RESERVACIONES
        pool.request().query(`
    SELECT 
      e.descripcion AS [Estado],
      COUNT(r.id) AS [Cantidad]
    FROM AAC_Alcatraz_reservaciones r
    INNER JOIN AAC_Alcatraz_estado_reservacion e ON r.estado_reservacion_id = e.id
    GROUP BY e.descripcion
    ORDER BY [Cantidad] DESC;
  `),
      ]);

      // Mapeo en el Return final del método (Asegurando los nombres exactos)
      const filaFinanzas = resFinanzas.recordset[0] as
        | Record<string, any>
        | undefined;
      const filaHistorico = resHistorico.recordset[0] as
        | Record<string, any>
        | undefined;

      return {
        finanzas: {
          totalBruto: Number(filaFinanzas?.["Total Bruto Cobrado"] || 0),
          totalNetoGanado: Number(filaFinanzas?.["Total Neto Cobrado"] || 0),
          // totalComisiones: Number(
          //   filaFinanzas?.["Total Comisiones Cobradas"] || 0,
          // ),
          totalComisiones: Number(filaFinanzas?.["Total Comisiones"] || 0),
          // 🆕 Exponemos los nuevos KPI de libros para que el dueño compare rendimientos
          hospedajeProyectado: Number(
            filaFinanzas?.["Hospedaje Proyectado"] || 0,
          ),
          utilidadProyectadaLibros: Number(
            filaFinanzas?.["Utilidad Proyectada Libros"] || 0,
          ),
        },
        plataformas: resPlataformas.recordset.map((row) => ({
          plataforma: String(row["Plataforma"] || "").trim(),
          cantidadReservaciones: Number(row["Cantidad Reservaciones"] || 0),
          totalDineroGenerado: Number(row["Total Dinero Generado"] || 0), // 💡 Mapeado exacto
        })),
        historico: {
          totalReservasHistoricas: Number(
            filaHistorico?.["Total Reservas Historicas"] || 0,
          ),
          totalDiasReservados: Number(
            filaHistorico?.["Total Dias Reservados"] || 0,
          ),
          totalHuespedesRecibidos: Number(
            filaHistorico?.["Total Huespedes Recibidos"] || 0,
          ),
          promedioDiasPorReserva: Number(
            filaHistorico?.["Promedio de Dias por Reserva"] || 0,
          ),
        },
        topClientes: resTopClientes.recordset.map((row) => ({
          cliente: String(row["Cliente"] || ""),
          correo: String(row["Correo"] || ""),
          cantidadViajes: Number(row["Cantidad Viajes"] || 0), // 💡 Mapeado exacto
          totalDineroGastado: Number(row["Total Dinero Gastado"] || 0),
        })),
        estados: resEstados.recordset.map((row) => ({
          estado: String(row["Estado"] || "").trim(),
          cantidad: Number(row["Cantidad"] || 0),
        })),
      };
    } catch (error) {
      // 👈 SOLUCIÓN: El catch va inmediatamente después de cerrar el try
      throw new Error(
        `Error al procesar las métricas reales del dashboard: ${(error as Error).message}`,
      );
    }
  }
}
