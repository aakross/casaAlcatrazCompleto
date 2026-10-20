import mssql from "mssql";
import {
  ActualizarReservaInput,
  AgregarExtraInput,
  CrearReservaInput,
  IReservaRepository,
  Reserva,
} from "../../domain/reservas.respository";
import { dbConfig } from "../../../../config/database";

export class ReservasRepository implements IReservaRepository {
  async findAll(): Promise<Reserva[]> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      // Ajusta el SELECT con los nombres exactos de tus columnas en la BD
      const result = await pool.request().query(`
     SELECT 
        res.id AS FolioReserva, cli.nombre, cli.apellido, cli.telefono, cli.email,
        res.fecha_inicio, res.fecha_fin, est.descripcion AS estadoDescripcion, ori.nombre AS origenNombre, 
        res.personas_hospedadas, res.total_dias_reservados, res.origen_reserva_id AS origenReservaId,
        ISNULL(res.precio_noche, 0.00) AS precioNoche,
        res.monto_total,
        ISNULL(res.monto_garantia, 0.00) AS montoGarantia,          
        ISNULL(res.porcentaje_comision, 0.00) AS porcentajeComision,
        ISNULL(res.monto_comision, 0.00) AS montoComision,     
        ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00) AS totalExtras,
        (res.monto_total + ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00)) AS granTotalEstancia,
        ISNULL((SELECT SUM(p.monto_bruto) FROM AAC_Alcatraz_pagos_cliente p WHERE p.reservacion_id = res.id), 0) AS montoPagado,
        ((res.monto_total + ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00)) - ISNULL((SELECT SUM(p.monto_bruto) FROM AAC_Alcatraz_pagos_cliente p WHERE p.reservacion_id = res.id), 0)) AS saldoPendiente,
        CASE 
          WHEN ISNULL((SELECT SUM(p.monto_bruto) FROM AAC_Alcatraz_pagos_cliente p WHERE p.reservacion_id = res.id), 0) >= 
               (res.monto_total + ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00)) THEN 'Pagado'
          ELSE 'Pendiente'
        END AS estatusPago
      FROM AAC_Alcatraz_reservaciones res
      JOIN AAC_Alcatraz_clientes cli ON res.cliente_id = cli.id
      JOIN AAC_Alcatraz_estado_reservacion est ON res.estado_reservacion_id = est.id
      JOIN AAC_Alcatraz_origen_reserva ori ON res.origen_reserva_id = ori.id
      ORDER BY FolioReserva DESC
    `);
      const rows = result.recordset as any[];
      // Mapeamos lo que viene de la BD al objeto "Reserva" del Dominio
      return rows.map((row) => ({
        id: row.FolioReserva,
        nombreCliente: row.nombre,
        apellidoCliente: row.apellido,
        telefono: row.telefono,
        email: row.email,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        estadoDescripcion: row.estadoDescripcion,
        origenNombre: row.origenNombre,
        montoTotal: Number(row.monto_total),
        totalDiasReservacion: row.total_dias_reservados,
        personasHospedadas: row.personas_hospedadas,
        montoPagado: Number(row.montoPagado),
        saldoPendiente: Number(row.saldoPendiente),
        estatusPago: row.estatusPago,
        porcentajeComision: Number(row.porcentajeComision),
        montoComision: Number(row.montoComision),
        gananciaNeto: Number(row.gananciaNeto),

        origenReservaId: Number(row.origenReservaId),
        precioNoche: Number(row.precioNoche),
        montoGarantia: Number(row.montoGarantia),
        totalExtras: Number(row.totalExtras),
        granTotalEstancia: Number(row.granTotalEstancia),
      }));
    } catch (error) {
      throw new Error(`Error al obtener reservas: ${(error as Error).message}`);
    }
  }

  // 2. BUSCAR POR ID
  async findById(id: number): Promise<Reserva | null> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      // 1. Query con las subconsultas financieras agregadas al SELECT
      const result = await pool.request().input("id", mssql.Int, id).query(`
      SELECT 
        res.id AS FolioReserva, 
        cli.nombre, 
        cli.apellido, 
        cli.telefono, 
        cli.email,
        res.fecha_inicio, 
        res.fecha_fin, 
        est.descripcion AS estadoDescripcion, 
        ori.nombre AS origenNombre, 
        
        -- Datos financieros brutos
        res.monto_total, 
        ISNULL(pagos.montoPagado, 0) AS montoPagado,
        
        -- NUEVO: Comisiones, garantías y subtotales dinámicos
        ISNULL(res.porcentaje_comision, 0.00) AS porcentajeComision,
        ISNULL(res.monto_comision, 0.00) AS montoComision,
        ISNULL(res.monto_neto, res.monto_total) AS gananciaNeto,
        res.origen_reserva_id AS origenReservaId,   
        ISNULL(res.precio_noche, 0.00) AS precioNoche, 
        ISNULL(res.monto_garantia, 0.00) AS montoGarantia, 

        -- Subconsultas para desgloses juntos y separados amarrados
        ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00) AS totalExtras,
        (res.monto_total + ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00)) AS granTotalEstancia,
        ((res.monto_total + ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00)) - ISNULL(pagos.montoPagado, 0)) AS saldoPendiente,
        
        CASE 
          WHEN ISNULL(pagos.montoPagado, 0) >= (res.monto_total + ISNULL((SELECT SUM(ex.monto) FROM AAC_Alcatraz_reservacion_extras ex WHERE ex.reservacion_id = res.id), 0.00)) THEN 'Pagado'
          ELSE 'Pendiente'
        END AS estatusPago,

        res.total_dias_reservados, 
        res.personas_hospedadas,
        DATEDIFF(day, GETDATE(), res.fecha_inicio) AS diasParaCheckIn
      FROM AAC_Alcatraz_reservaciones res
      JOIN AAC_Alcatraz_clientes cli ON res.cliente_id = cli.id
      JOIN AAC_Alcatraz_estado_reservacion est ON res.estado_reservacion_id = est.id
      JOIN AAC_Alcatraz_origen_reserva ori ON res.origen_reserva_id = ori.id
      
      LEFT JOIN (
          SELECT reservacion_id, SUM(monto_bruto) AS montoPagado
          FROM AAC_Alcatraz_pagos_cliente
          GROUP BY reservacion_id
      ) pagos ON res.id = pagos.reservacion_id
      
      WHERE res.id = @id
    `);

      const row = result.recordset[0] as any;
      if (!row) return null;

      // 2. Consulta de los extras desglosados
      const resultExtras = await pool.request().input("id", mssql.Int, id)
        .query(`
      SELECT id, concepto, cantidad, dias, precio_unitario_noche AS precioUnitarioNoche, monto, tipo_evento AS tipoEvento, 
      ISNULL(porcentaje_comision, 0.00) AS porcentajeComision,
      ISNULL(monto_comision, 0.00) AS montoComision 
      FROM AAC_Alcatraz_reservacion_extras
      WHERE reservacion_id = @id
    `);

      // 3. Retornamos mapeando las propiedades financieras en la RAÍZ del objeto
      return {
        id: row.FolioReserva,
        nombreCliente: row.nombre,
        apellidoCliente: row.apellido,
        telefono: row.telefono,
        email: row.email,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        estadoDescripcion: row.estadoDescripcion,
        origenNombre: row.origenNombre,
        montoTotal: Number(row.monto_total),
        totalDiasReservacion: row.total_dias_reservados,
        personasHospedadas: row.personas_hospedadas,

        montoPagado: Number(row.montoPagado),
        saldoPendiente: Number(row.saldoPendiente),
        estatusPago: row.estatusPago,
        diasParaCheckIn: Number(row.diasParaCheckIn),

        porcentajeComision: Number(row.porcentajeComision),
        montoComision: Number(row.montoComision),
        gananciaNeto: Number(row.gananciaNeto),

        origenReservaId: Number(row.origenReservaId),
        precioNoche: Number(row.precioNoche),
        montoGarantia: Number(row.montoGarantia),

        //  AQUÍ CORREGIDO: En la raíz de la Reserva para satisfacer al Dominio
        totalExtras: Number(row.totalExtras),
        granTotalEstancia: Number(row.granTotalEstancia),

        // El mapeo de extras se queda limpio, únicamente con sus propiedades de renglón
        extras: resultExtras.recordset.map((ext: any) => ({
          id: ext.id,
          concepto: ext.concepto,
          tipoEvento: ext.tipoEvento ? String(ext.tipoEvento).trim() : "",
          cantidad: Number(ext.cantidad),
          dias: Number(ext.dias),
          precioUnitarioNoche: Number(ext.precioUnitarioNoche),
          monto: Number(ext.monto),
          porcentajeComision: Number(ext.porcentajeComision),
          montoComision: Number(ext.montoComision),
        })),
      };
    } catch (error) {
      throw new Error(
        `Error al buscar reserva por ID: ${(error as Error).message}`,
      );
    }
  }

  // 3. CREAR RESERVA (Ejecutando tu Procedimiento Almacenado)
  async create(
    reserva: CrearReservaInput,
  ): Promise<{ id: number } & CrearReservaInput> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      let extrasXml: string | null = null;

      if (reserva.extras && reserva.extras.length > 0) {
        // Mapeamos cada objeto del array a etiquetas <item> estándar
        const itemsXml = reserva.extras
          .map(
            (ext) => `
          <item>
            <concepto>${ext.concepto.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</concepto>
            <tipoEvento>${(ext.tipoEvento || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")}</tipoEvento>
            <monto>${ext.monto}</monto>
            <cantidad>${ext.cantidad}</cantidad>
            <dias>${ext.dias}</dias>
            <precioUnitarioNoche>${ext.precioUnitarioNoche}</precioUnitarioNoche>
            <porcentajeComision>${ext.porcentajeComision || 0}</porcentajeComision> 
            <montoComision>${ext.montoComision || 0}</montoComision> 
          </item>`,
          )
          .join("");
        extrasXml = `<extras>${itemsXml}</extras>`;
      }

      const result = await pool
        .request()
        .input("IdUsuario", mssql.Int, reserva.usuarioId)
        .input("NombreCliente", mssql.VarChar, reserva.nombreCliente)
        .input("ApellidoCliente", mssql.VarChar, reserva.apellidoCliente)
        .input("Telefono", mssql.VarChar, reserva.telefono)
        .input("Email", mssql.VarChar, reserva.email)
        .input("FechaInicio", mssql.DateTime, reserva.fechaInicio)
        .input("FechaFin", mssql.DateTime, reserva.fechaFin)
        .input("TotalDiasReservados", mssql.Int, reserva.totalDiasReservacion)
        .input("MontoTotal", mssql.Decimal(10, 2), reserva.montoTotal)
        .input("OrigenReservaId", mssql.Int, reserva.origenReservaId)
        .input(
          "NuevoOrigenNombre",
          mssql.VarChar,
          reserva.nuevoOrigenNombre || null,
        )
        .input("PersonasHospedadas", mssql.Int, reserva.personasHospedadas)
        .input("ExtrasXml", mssql.Xml, extrasXml)
        .input("PrecioNoche", mssql.Decimal(10, 2), reserva.precioNoche)
        .input(
          "PorcentajeComision",
          mssql.Decimal(5, 2),
          reserva.porcentajeComision,
        )
        .input("MontoGarantia", mssql.Decimal(10, 2), reserva.montoGarantia)
        .execute("AAC_Alcatraz_Crear_Reservacion");

      const idCreado = result.recordset[0]?.id || 999;

      return {
        id: idCreado,
        ...reserva,
      };
    } catch (error) {
      throw new Error(
        `Error al ejecutar el SP de creación: ${(error as Error).message}`,
      );
    }
  }

  async agregarExtra(
    input: AgregarExtraInput,
  ): Promise<{ success: boolean; montoCalculado: number }> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);

      const result = await pool
        .request()
        .input("ReservacionId", mssql.Int, input.reservacionId)
        .input("Concepto", mssql.VarChar(100), input.concepto)
        .input("Cantidad", mssql.Int, input.cantidad)
        .input("Dias", mssql.Int, input.dias)
        .input(
          "PrecioUnitario",
          mssql.Decimal(10, 2),
          input.precioUnitarioNoche,
        )
        .input("IdUsuario", mssql.Int, input.usuarioId)
        .execute("AAC_Alcatraz_Agregar_Extra_Reserva");

      const montoCalculado = result.recordset[0]?.MontoExtra || 0;

      return {
        success: true,
        montoCalculado: Number(montoCalculado),
      };
    } catch (error) {
      throw new Error(
        `[Repository] Error al agregar extra: ${(error as Error).message}`,
      );
    }
  }

  async actualizarReserva(
    input: ActualizarReservaInput,
  ): Promise<{ success: boolean }> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);
      let extrasXml: string | null = null;

      if (input.extras && input.extras.length > 0) {
        const itemsXml = input.extras
          .map(
            (ext) => `
          <item>
            <concepto>${ext.concepto.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</concepto>
            <tipoEvento>${(ext.tipoEvento || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")}</tipoEvento>
            <monto>${ext.monto}</monto>
            <cantidad>${ext.cantidad}</cantidad>
            <dias>${ext.dias}</dias>
            <precioUnitarioNoche>${ext.precioUnitarioNoche}</precioUnitarioNoche>
            <porcentajeComision>${ext.porcentajeComision || 0}</porcentajeComision> 
            <montoComision>${ext.montoComision || 0}</montoComision> 
          </item>`,
          )
          .join("");

        extrasXml = `<extras>${itemsXml}</extras>`;
      }

      if (!input.usuarioId || isNaN(input.usuarioId) || input.usuarioId <= 0) {
        throw new Error("[Repository] IdUsuario no válido para la actualización.");
      }

      await pool
        .request()
        .input("ReservacionId", mssql.Int, input.reservacionId)
        .input("FechaInicio", mssql.DateTime, input.fechaInicio)
        .input("FechaFin", mssql.DateTime, input.fechaFin)
        .input("TotalDiasReservados", mssql.Int, input.totalDiasReservacion)
        .input("PrecioNoche", mssql.Decimal(10, 2), input.precioNoche)
        .input("MontoTotal", mssql.Decimal(10, 2), input.montoTotal)
        .input("PersonasHospedadas", mssql.Int, input.personasHospedadas)
        .input("IdUsuario", mssql.Int, Number(input.usuarioId))
        .input(
          "ApellidoCliente",
          mssql.VarChar(100),
          input.apellidoHuesped || null,
        )
        .input("Telefono", mssql.VarChar(20), input.telefono || null)
        .input("NombreCliente", mssql.VarChar(100), input.nombreHuesped || null)
        .input("ExtrasXml", mssql.Xml, extrasXml)
        .input("OrigenReservaId", mssql.Int, input.origenReservaId || null) 
        .execute("AAC_Alcatraz_Actualizar_Reservacion");

      return {
        success: true,
      };
    } catch (error) {
      throw new Error(
        `[Repository] Error al actualizar la reservación: ${(error as Error).message}`,
      );
    }
  }

  async eliminar(id: number, usuarioId: number): Promise<{ success: boolean }> {
    let pool;
    try {
      if (!usuarioId || isNaN(usuarioId) || usuarioId <= 0) {
        throw new Error("[Repository] IdUsuario no válido para la eliminación.");
      }
      pool = await mssql.connect(dbConfig);
      await pool
        .request()
        .input("ReservacionId", mssql.Int, Number(id))
        .input("IdUsuario", mssql.Int, Number(usuarioId))
        .execute("dbo.AAC_Alcatraz_Eliminar_Reservacion_Verificada");

      return { success: true };
    } catch (error) {
      throw new Error(`[Repository] ${(error as Error).message}`);
    }
  }
}
