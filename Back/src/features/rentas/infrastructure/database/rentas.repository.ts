import mssql from "mssql";
import { dbConfig } from "../../../../config/database";
import { IRentasRepository } from "../../domain/rentas.repository.interface";
import {
  Region,
  Lugar,
  LocalComercial,
  ContratoRenta,
  PagoRenta,
  AuditoriaPagoRenta,
  AdeudoResumen,
  DashboardRentas,
} from "../../domain/rentas.types";

export class RentasRepository implements IRentasRepository {
  // =========================================================================
  // 1. REGIONES
  // =========================================================================
  async obtenerRegiones(): Promise<Region[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT id, nombre, descripcion, activo, usuario_creo_id, fecha_creacion, usuario_modifico_id, fecha_modificacion
      FROM dbo.rentas_regiones
      WHERE activo = 1
      ORDER BY nombre ASC;
    `);
    return result.recordset;
  }

  async crearRegion(nombre: string, descripcion: string | null, usuarioId: number): Promise<Region> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("nombre", mssql.VarChar(100), nombre)
      .input("descripcion", mssql.VarChar(255), descripcion)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        INSERT INTO dbo.rentas_regiones (nombre, descripcion, activo, usuario_creo_id, fecha_creacion)
        OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.activo, INSERTED.usuario_creo_id, INSERTED.fecha_creacion
        VALUES (@nombre, @descripcion, 1, @usuarioId, GETDATE());
      `);
    return result.recordset[0];
  }

  // =========================================================================
  // 2. LUGARES / COMPLEJOS
  // =========================================================================
  async obtenerLugares(regionId?: number): Promise<Lugar[]> {
    const pool = await mssql.connect(dbConfig);
    const request = pool.request();
    let query = `
      SELECT l.id, l.region_id, r.nombre AS region_nombre, l.nombre, l.direccion, 
             l.activo, l.usuario_creo_id, l.fecha_creacion, l.usuario_modifico_id, l.fecha_modificacion
      FROM dbo.rentas_lugares l
      INNER JOIN dbo.rentas_regiones r ON r.id = l.region_id AND r.activo = 1
      WHERE l.activo = 1
    `;
    if (regionId) {
      request.input("regionId", mssql.Int, regionId);
      query += ` AND l.region_id = @regionId`;
    }
    query += ` ORDER BY l.nombre ASC;`;
    const result = await request.query(query);
    return result.recordset;
  }

  async crearLugar(
    regionId: number,
    nombre: string,
    direccion: string | null,
    usuarioId: number
  ): Promise<Lugar> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("regionId", mssql.Int, regionId)
      .input("nombre", mssql.VarChar(150), nombre)
      .input("direccion", mssql.VarChar(255), direccion)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        INSERT INTO dbo.rentas_lugares (region_id, nombre, direccion, activo, usuario_creo_id, fecha_creacion)
        OUTPUT INSERTED.id, INSERTED.region_id, INSERTED.nombre, INSERTED.direccion, INSERTED.activo, INSERTED.usuario_creo_id, INSERTED.fecha_creacion
        VALUES (@regionId, @nombre, @direccion, 1, @usuarioId, GETDATE());
      `);
    return result.recordset[0];
  }

  // =========================================================================
  // 3. LOCALES / CASETAS
  // =========================================================================
  async obtenerLocales(lugarId?: number): Promise<LocalComercial[]> {
    const pool = await mssql.connect(dbConfig);
    const request = pool.request();
    let query = `
      SELECT loc.id, loc.lugar_id, lug.nombre AS lugar_nombre, r.nombre AS region_nombre,
             loc.numero_fisico, loc.nickname, loc.monto_renta_sugerido, loc.descripcion,
             loc.activo, loc.usuario_creo_id, loc.fecha_creacion, loc.usuario_modifico_id, loc.fecha_modificacion,
             CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS ocupado,
             c.id AS contrato_vigente_id,
             c.arrendatario_nombre AS arrendatario_actual
      FROM dbo.rentas_locales loc
      INNER JOIN dbo.rentas_lugares lug ON lug.id = loc.lugar_id AND lug.activo = 1
      INNER JOIN dbo.rentas_regiones r ON r.id = lug.region_id AND r.activo = 1
      LEFT JOIN dbo.rentas_contratos c ON c.local_id = loc.id AND c.vigente = 1 AND c.activo = 1
      WHERE loc.activo = 1
    `;
    if (lugarId) {
      request.input("lugarId", mssql.Int, lugarId);
      query += ` AND loc.lugar_id = @lugarId`;
    }
    query += ` ORDER BY lug.nombre ASC, loc.numero_fisico ASC, loc.nickname ASC;`;
    const result = await request.query(query);
    return result.recordset.map((row) => ({
      ...row,
      ocupado: Boolean(row.ocupado),
    }));
  }

  async crearLocal(
    data: {
      lugar_id: number;
      numero_fisico: string;
      nickname: string;
      monto_renta_sugerido: number;
      descripcion?: string | null;
    },
    usuarioId: number
  ): Promise<LocalComercial> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("lugarId", mssql.Int, data.lugar_id)
      .input("numeroFisico", mssql.VarChar(50), data.numero_fisico)
      .input("nickname", mssql.VarChar(100), data.nickname)
      .input("montoSugerido", mssql.Decimal(12, 2), data.monto_renta_sugerido)
      .input("descripcion", mssql.VarChar(255), data.descripcion || null)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        INSERT INTO dbo.rentas_locales (
          lugar_id, numero_fisico, nickname, monto_renta_sugerido, descripcion, activo, usuario_creo_id, fecha_creacion
        )
        OUTPUT INSERTED.id, INSERTED.lugar_id, INSERTED.numero_fisico, INSERTED.nickname, 
               INSERTED.monto_renta_sugerido, INSERTED.descripcion, INSERTED.activo, INSERTED.usuario_creo_id, INSERTED.fecha_creacion
        VALUES (@lugarId, @numeroFisico, @nickname, @montoSugerido, @descripcion, 1, @usuarioId, GETDATE());
      `);
    return result.recordset[0];
  }

  async actualizarLocal(
    id: number,
    data: {
      lugar_id: number;
      numero_fisico: string;
      nickname: string;
      monto_renta_sugerido: number;
      descripcion?: string | null;
    },
    usuarioId: number
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", mssql.Int, id)
      .input("lugarId", mssql.Int, data.lugar_id)
      .input("numeroFisico", mssql.VarChar(50), data.numero_fisico)
      .input("nickname", mssql.VarChar(100), data.nickname)
      .input("montoSugerido", mssql.Decimal(12, 2), data.monto_renta_sugerido)
      .input("descripcion", mssql.VarChar(255), data.descripcion || null)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        UPDATE dbo.rentas_locales
        SET lugar_id = @lugarId,
            numero_fisico = @numeroFisico,
            nickname = @nickname,
            monto_renta_sugerido = @montoSugerido,
            descripcion = @descripcion,
            usuario_modifico_id = @usuarioId,
            fecha_modificacion = GETDATE()
        WHERE id = @id AND activo = 1;
      `);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  async eliminarLocal(id: number, usuarioId: number): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", mssql.Int, id)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        UPDATE dbo.rentas_locales
        SET activo = 0,
            usuario_modifico_id = @usuarioId,
            fecha_modificacion = GETDATE()
        WHERE id = @id;
      `);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  // =========================================================================
  // 4. CONTRATOS DE RENTA
  // =========================================================================
  async obtenerContratos(localId?: number): Promise<ContratoRenta[]> {
    const pool = await mssql.connect(dbConfig);
    const request = pool.request();
    let query = `
      SELECT c.id, c.local_id, loc.numero_fisico AS local_numero, loc.nickname AS local_nickname,
             lug.nombre AS lugar_nombre, c.arrendatario_nombre, c.arrendatario_telefono, c.arrendatario_email,
             CONVERT(VARCHAR(10), c.fecha_inicio, 120) AS fecha_inicio,
             CONVERT(VARCHAR(10), c.fecha_fin, 120) AS fecha_fin,
             c.monto_renta_mensual, c.dia_corte, c.vigente, c.activo,
             c.usuario_creo_id, c.fecha_creacion, c.usuario_modifico_id, c.fecha_modificacion
      FROM dbo.rentas_contratos c
      INNER JOIN dbo.rentas_locales loc ON loc.id = c.local_id AND loc.activo = 1
      INNER JOIN dbo.rentas_lugares lug ON lug.id = loc.lugar_id AND lug.activo = 1
      WHERE c.activo = 1
    `;
    if (localId) {
      request.input("localId", mssql.Int, localId);
      query += ` AND c.local_id = @localId`;
    }
    query += ` ORDER BY c.vigente DESC, c.fecha_inicio DESC;`;
    const result = await request.query(query);
    return result.recordset;
  }

  async crearContrato(
    data: {
      local_id: number;
      arrendatario_nombre: string;
      arrendatario_telefono?: string | null;
      arrendatario_email?: string | null;
      fecha_inicio: string;
      fecha_fin?: string | null;
      monto_renta_mensual: number;
      dia_corte: number;
    },
    usuarioId: number
  ): Promise<ContratoRenta> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("localId", mssql.Int, data.local_id)
      .input("arrendatarioNombre", mssql.VarChar(150), data.arrendatario_nombre)
      .input("telefono", mssql.VarChar(30), data.arrendatario_telefono || null)
      .input("email", mssql.VarChar(100), data.arrendatario_email || null)
      .input("fechaInicio", mssql.Date, data.fecha_inicio)
      .input("fechaFin", mssql.Date, data.fecha_fin || null)
      .input("monto", mssql.Decimal(12, 2), data.monto_renta_mensual)
      .input("diaCorte", mssql.Int, data.dia_corte || 1)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        -- Desactivar cualquier otro contrato vigente en este local
        UPDATE dbo.rentas_contratos
        SET vigente = 0, usuario_modifico_id = @usuarioId, fecha_modificacion = GETDATE()
        WHERE local_id = @localId AND vigente = 1;

        INSERT INTO dbo.rentas_contratos (
          local_id, arrendatario_nombre, arrendatario_telefono, arrendatario_email,
          fecha_inicio, fecha_fin, monto_renta_mensual, dia_corte, vigente, activo,
          usuario_creo_id, fecha_creacion
        )
        OUTPUT INSERTED.id, INSERTED.local_id, INSERTED.arrendatario_nombre, INSERTED.arrendatario_telefono,
               INSERTED.arrendatario_email, INSERTED.fecha_inicio, INSERTED.fecha_fin,
               INSERTED.monto_renta_mensual, INSERTED.dia_corte, INSERTED.vigente, INSERTED.activo,
               INSERTED.usuario_creo_id, INSERTED.fecha_creacion
        VALUES (
          @localId, @arrendatarioNombre, @telefono, @email,
          @fechaInicio, @fechaFin, @monto, @diaCorte, 1, 1,
          @usuarioId, GETDATE()
        );
      `);
    return result.recordset[0];
  }

  async actualizarContrato(
    id: number,
    data: {
      arrendatario_nombre: string;
      arrendatario_telefono?: string | null;
      arrendatario_email?: string | null;
      fecha_fin?: string | null;
      monto_renta_mensual: number;
      dia_corte: number;
      vigente: boolean;
    },
    usuarioId: number
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", mssql.Int, id)
      .input("nombre", mssql.VarChar(150), data.arrendatario_nombre)
      .input("telefono", mssql.VarChar(30), data.arrendatario_telefono || null)
      .input("email", mssql.VarChar(100), data.arrendatario_email || null)
      .input("fechaFin", mssql.Date, data.fecha_fin || null)
      .input("monto", mssql.Decimal(12, 2), data.monto_renta_mensual)
      .input("diaCorte", mssql.Int, data.dia_corte)
      .input("vigente", mssql.Bit, data.vigente)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        UPDATE dbo.rentas_contratos
        SET arrendatario_nombre = @nombre,
            arrendatario_telefono = @telefono,
            arrendatario_email = @email,
            fecha_fin = @fechaFin,
            monto_renta_mensual = @monto,
            dia_corte = @diaCorte,
            vigente = @vigente,
            usuario_modifico_id = @usuarioId,
            fecha_modificacion = GETDATE()
        WHERE id = @id AND activo = 1;
      `);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  async finalizarContrato(id: number, usuarioId: number): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", mssql.Int, id)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        UPDATE dbo.rentas_contratos
        SET vigente = 0,
            fecha_fin = COALESCE(fecha_fin, CAST(GETDATE() AS DATE)),
            usuario_modifico_id = @usuarioId,
            fecha_modificacion = GETDATE()
        WHERE id = @id AND activo = 1;
      `);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  // =========================================================================
  // 5. PAGOS DE RENTA
  // =========================================================================
  async obtenerPagos(contratoId?: number): Promise<PagoRenta[]> {
    const pool = await mssql.connect(dbConfig);
    const request = pool.request();
    let query = `
      SELECT p.id, p.contrato_id, loc.nickname AS local_nickname, c.arrendatario_nombre,
             p.monto, p.meses_cubiertos,
             CONVERT(VARCHAR(10), p.fecha_abono_real, 120) AS fecha_abono_real,
             p.fecha_captura, p.metodo_pago, p.referencia_bancaria, p.nota,
             p.activo, p.usuario_creo_id, u.[user] AS usuario_creo_nombre,
             p.fecha_creacion, p.usuario_modifico_id, p.fecha_modificacion
      FROM dbo.rentas_pagos p
      INNER JOIN dbo.rentas_contratos c ON c.id = p.contrato_id AND c.activo = 1
      INNER JOIN dbo.rentas_locales loc ON loc.id = c.local_id AND loc.activo = 1
      LEFT JOIN dbo.AAC_Alcatraz_usuarios u ON u.id = p.usuario_creo_id
      WHERE p.activo = 1
    `;
    if (contratoId) {
      request.input("contratoId", mssql.Int, contratoId);
      query += ` AND p.contrato_id = @contratoId`;
    }
    query += ` ORDER BY p.fecha_abono_real DESC, p.fecha_captura DESC;`;
    const result = await request.query(query);
    return result.recordset;
  }

  async crearPago(
    data: {
      contrato_id: number;
      monto: number;
      meses_cubiertos: number;
      fecha_abono_real: string;
      metodo_pago: string;
      referencia_bancaria?: string | null;
      nota?: string | null;
    },
    usuarioId: number
  ): Promise<PagoRenta> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("contratoId", mssql.Int, data.contrato_id)
      .input("monto", mssql.Decimal(12, 2), data.monto)
      .input("mesesCubiertos", mssql.Decimal(5, 2), data.meses_cubiertos || 1.0)
      .input("fechaAbonoReal", mssql.Date, data.fecha_abono_real)
      .input("metodoPago", mssql.VarChar(50), data.metodo_pago || "Efectivo")
      .input("referencia", mssql.VarChar(100), data.referencia_bancaria || null)
      .input("nota", mssql.VarChar(500), data.nota || null)
      .input("usuarioId", mssql.Int, usuarioId).query(`
        INSERT INTO dbo.rentas_pagos (
          contrato_id, monto, meses_cubiertos, fecha_abono_real, fecha_captura,
          metodo_pago, referencia_bancaria, nota, activo, usuario_creo_id, fecha_creacion
        )
        OUTPUT INSERTED.id, INSERTED.contrato_id, INSERTED.monto, INSERTED.meses_cubiertos,
               CONVERT(VARCHAR(10), INSERTED.fecha_abono_real, 120) AS fecha_abono_real,
               INSERTED.fecha_captura, INSERTED.metodo_pago, INSERTED.referencia_bancaria,
               INSERTED.nota, INSERTED.activo, INSERTED.usuario_creo_id, INSERTED.fecha_creacion
        VALUES (
          @contratoId, @monto, @mesesCubiertos, @fechaAbonoReal, GETDATE(),
          @metodoPago, @referencia, @nota, 1, @usuarioId, GETDATE()
        );
      `);
    return result.recordset[0];
  }

  async actualizarPagoConAuditoria(
    id: number,
    data: {
      monto: number;
      meses_cubiertos: number;
      fecha_abono_real: string;
      metodo_pago: string;
      referencia_bancaria?: string | null;
      nota?: string | null;
      motivo_cambio: string;
    },
    usuarioId: number
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const transaction = new mssql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Obtener datos actuales del pago para la bitácora
      const requestSel = new mssql.Request(transaction);
      const selResult = await requestSel.input("id", mssql.Int, id).query(`
        SELECT monto, meses_cubiertos, CONVERT(VARCHAR(10), fecha_abono_real, 120) AS fecha_abono_real
        FROM dbo.rentas_pagos
        WHERE id = @id AND activo = 1;
      `);

      if (selResult.recordset.length === 0) {
        await transaction.rollback();
        return false;
      }

      const anterior = selResult.recordset[0];

      // 2. Registrar en log de auditoría
      const requestLog = new mssql.Request(transaction);
      await requestLog
        .input("pagoId", mssql.Int, id)
        .input("accion", mssql.VarChar(30), "EDICION")
        .input("montoAnt", mssql.Decimal(12, 2), anterior.monto)
        .input("montoNuevo", mssql.Decimal(12, 2), data.monto)
        .input("fechaAnt", mssql.Date, anterior.fecha_abono_real)
        .input("fechaNueva", mssql.Date, data.fecha_abono_real)
        .input("mesesAnt", mssql.Decimal(5, 2), anterior.meses_cubiertos)
        .input("mesesNuevos", mssql.Decimal(5, 2), data.meses_cubiertos)
        .input("motivo", mssql.VarChar(255), data.motivo_cambio)
        .input("usuarioId", mssql.Int, usuarioId).query(`
          INSERT INTO dbo.rentas_log_auditoria_pagos (
            pago_id, accion, monto_anterior, monto_nuevo,
            fecha_abono_anterior, fecha_abono_nuevo,
            meses_cubiertos_anterior, meses_cubiertos_nuevo,
            motivo_cambio, usuario_id, fecha_evento
          ) VALUES (
            @pagoId, @accion, @montoAnt, @montoNuevo,
            @fechaAnt, @fechaNueva,
            @mesesAnt, @mesesNuevos,
            @motivo, @usuarioId, GETDATE()
          );
        `);

      // 3. Actualizar el pago
      const requestUpd = new mssql.Request(transaction);
      await requestUpd
        .input("id", mssql.Int, id)
        .input("monto", mssql.Decimal(12, 2), data.monto)
        .input("mesesCubiertos", mssql.Decimal(5, 2), data.meses_cubiertos)
        .input("fechaAbonoReal", mssql.Date, data.fecha_abono_real)
        .input("metodoPago", mssql.VarChar(50), data.metodo_pago)
        .input("referencia", mssql.VarChar(100), data.referencia_bancaria || null)
        .input("nota", mssql.VarChar(500), data.nota || null)
        .input("usuarioId", mssql.Int, usuarioId).query(`
          UPDATE dbo.rentas_pagos
          SET monto = @monto,
              meses_cubiertos = @mesesCubiertos,
              fecha_abono_real = @fechaAbonoReal,
              metodo_pago = @metodoPago,
              referencia_bancaria = @referencia,
              nota = @nota,
              usuario_modifico_id = @usuarioId,
              fecha_modificacion = GETDATE()
          WHERE id = @id AND activo = 1;
        `);

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async eliminarPagoConAuditoria(
    id: number,
    motivo_cambio: string,
    usuarioId: number
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const transaction = new mssql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Obtener datos actuales
      const requestSel = new mssql.Request(transaction);
      const selResult = await requestSel.input("id", mssql.Int, id).query(`
        SELECT monto, meses_cubiertos, CONVERT(VARCHAR(10), fecha_abono_real, 120) AS fecha_abono_real
        FROM dbo.rentas_pagos
        WHERE id = @id AND activo = 1;
      `);

      if (selResult.recordset.length === 0) {
        await transaction.rollback();
        return false;
      }

      const anterior = selResult.recordset[0];

      // 2. Insertar en auditoría
      const requestLog = new mssql.Request(transaction);
      await requestLog
        .input("pagoId", mssql.Int, id)
        .input("accion", mssql.VarChar(30), "BAJA_LOGICA")
        .input("montoAnt", mssql.Decimal(12, 2), anterior.monto)
        .input("montoNuevo", mssql.Decimal(12, 2), 0.0)
        .input("fechaAnt", mssql.Date, anterior.fecha_abono_real)
        .input("fechaNueva", mssql.Date, anterior.fecha_abono_real)
        .input("mesesAnt", mssql.Decimal(5, 2), anterior.meses_cubiertos)
        .input("mesesNuevos", mssql.Decimal(5, 2), 0.0)
        .input("motivo", mssql.VarChar(255), motivo_cambio)
        .input("usuarioId", mssql.Int, usuarioId).query(`
          INSERT INTO dbo.rentas_log_auditoria_pagos (
            pago_id, accion, monto_anterior, monto_nuevo,
            fecha_abono_anterior, fecha_abono_nuevo,
            meses_cubiertos_anterior, meses_cubiertos_nuevo,
            motivo_cambio, usuario_id, fecha_evento
          ) VALUES (
            @pagoId, @accion, @montoAnt, @montoNuevo,
            @fechaAnt, @fechaNueva,
            @mesesAnt, @mesesNuevos,
            @motivo, @usuarioId, GETDATE()
          );
        `);

      // 3. Baja lógica
      const requestUpd = new mssql.Request(transaction);
      await requestUpd
        .input("id", mssql.Int, id)
        .input("usuarioId", mssql.Int, usuarioId).query(`
          UPDATE dbo.rentas_pagos
          SET activo = 0,
              usuario_modifico_id = @usuarioId,
              fecha_modificacion = GETDATE()
          WHERE id = @id AND activo = 1;
        `);

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async obtenerAuditoriaPago(pagoId: number): Promise<AuditoriaPagoRenta[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().input("pagoId", mssql.Int, pagoId).query(`
      SELECT log.id, log.pago_id, log.accion, log.monto_anterior, log.monto_nuevo,
             CONVERT(VARCHAR(10), log.fecha_abono_anterior, 120) AS fecha_abono_anterior,
             CONVERT(VARCHAR(10), log.fecha_abono_nuevo, 120) AS fecha_abono_nuevo,
             log.meses_cubiertos_anterior, log.meses_cubiertos_nuevo,
             log.motivo_cambio, log.usuario_id, u.[user] AS usuario_nombre, log.fecha_evento
      FROM dbo.rentas_log_auditoria_pagos log
      LEFT JOIN dbo.AAC_Alcatraz_usuarios u ON u.id = log.usuario_id
      WHERE log.pago_id = @pagoId
      ORDER BY log.fecha_evento DESC;
    `);
    return result.recordset;
  }

  // =========================================================================
  // 6. CONTROL DE ADEUDOS
  // =========================================================================
  async obtenerControlAdeudos(): Promise<AdeudoResumen[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        c.id AS contrato_id,
        r.nombre AS region,
        lug.nombre AS lugar,
        loc.numero_fisico,
        loc.nickname,
        c.arrendatario_nombre,
        CONVERT(VARCHAR(10), c.fecha_inicio, 120) AS fecha_inicio,
        c.dia_corte,
        c.monto_renta_mensual,
        CASE 
          WHEN DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) < 0 THEN 0
          ELSE 
            DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) 
            + CASE WHEN DAY(GETDATE()) >= c.dia_corte THEN 1 ELSE 0 END
        END AS meses_cobrables,
        COALESCE(pagos.total_meses_pagados, 0) AS meses_pagados,
        COALESCE(pagos.total_monto_pagado, 0.00) AS total_pagado,
        (
          CASE 
            WHEN DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) < 0 THEN 0
            ELSE 
              DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) 
              + CASE WHEN DAY(GETDATE()) >= c.dia_corte THEN 1 ELSE 0 END
          END - COALESCE(pagos.total_meses_pagados, 0)
        ) AS meses_adeudo,
        (
          (
            CASE 
              WHEN DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) < 0 THEN 0
              ELSE 
                DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) 
                + CASE WHEN DAY(GETDATE()) >= c.dia_corte THEN 1 ELSE 0 END
            END - COALESCE(pagos.total_meses_pagados, 0)
          ) * c.monto_renta_mensual
        ) AS monto_adeudo,
        CASE 
          WHEN (
            CASE 
              WHEN DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) < 0 THEN 0
              ELSE DATEDIFF(MONTH, c.fecha_inicio, GETDATE()) + CASE WHEN DAY(GETDATE()) >= c.dia_corte THEN 1 ELSE 0 END
            END - COALESCE(pagos.total_meses_pagados, 0)
          ) <= 0 THEN 'AL CORRIENTE'
          ELSE 'CON ADEUDO'
        END AS estatus_cartera
      FROM dbo.rentas_contratos c
      INNER JOIN dbo.rentas_locales loc ON loc.id = c.local_id AND loc.activo = 1
      INNER JOIN dbo.rentas_lugares lug ON lug.id = loc.lugar_id AND lug.activo = 1
      INNER JOIN dbo.rentas_regiones r ON r.id = lug.region_id AND r.activo = 1
      OUTER APPLY (
        SELECT 
          SUM(p.meses_cubiertos) AS total_meses_pagados,
          SUM(p.monto) AS total_monto_pagado
        FROM dbo.rentas_pagos p
        WHERE p.contrato_id = c.id AND p.activo = 1
      ) pagos
      WHERE c.vigente = 1 AND c.activo = 1
      ORDER BY meses_adeudo DESC, loc.nickname ASC;
    `);

    return result.recordset.map((row) => ({
      ...row,
      monto_renta_mensual: Number(row.monto_renta_mensual),
      meses_cobrables: Number(row.meses_cobrables),
      meses_pagados: Number(row.meses_pagados),
      total_pagado: Number(row.total_pagado),
      meses_adeudo: Number(row.meses_adeudo),
      monto_adeudo: Number(row.monto_adeudo),
    }));
  }

  // =========================================================================
  // 7. DASHBOARD DE RENTAS
  // =========================================================================
  async obtenerDashboard(): Promise<DashboardRentas> {
    const pool = await mssql.connect(dbConfig);

    // A. Métricas de Ocupación
    const ocupacionRes = await pool.request().query(`
      SELECT 
        COUNT(loc.id) AS total_locales,
        COUNT(c.id) AS locales_rentados,
        COUNT(loc.id) - COUNT(c.id) AS locales_disponibles,
        ROUND(CAST(COUNT(c.id) AS FLOAT) / NULLIF(COUNT(loc.id), 0) * 100, 2) AS porcentaje_ocupacion
      FROM dbo.rentas_locales loc
      LEFT JOIN dbo.rentas_contratos c ON c.local_id = loc.id AND c.vigente = 1 AND c.activo = 1
      WHERE loc.activo = 1;
    `);
    const o = ocupacionRes.recordset[0] || {
      total_locales: 0,
      locales_rentados: 0,
      locales_disponibles: 0,
      porcentaje_ocupacion: 0,
    };

    // B. Cartera (Al corriente vs Adeudo)
    const adeudos = await this.obtenerControlAdeudos();
    let contratosAlCorriente = 0;
    let contratosConAdeudo = 0;
    let montoDeudaAcumulada = 0;

    for (const a of adeudos) {
      if (a.estatus_cartera === "AL CORRIENTE") {
        contratosAlCorriente++;
      } else {
        contratosConAdeudo++;
        if (a.monto_adeudo > 0) {
          montoDeudaAcumulada += a.monto_adeudo;
        }
      }
    }

    // C. Ingresos Mes Actual (Por Fecha de Abono Real)
    const ingresosMesRes = await pool.request().query(`
      SELECT 
        COALESCE(SUM(p.monto), 0.00) AS total_ingreso,
        COUNT(p.id) AS total_pagos
      FROM dbo.rentas_pagos p
      WHERE p.activo = 1
        AND MONTH(p.fecha_abono_real) = MONTH(GETDATE())
        AND YEAR(p.fecha_abono_real) = YEAR(GETDATE());
    `);
    const ing = ingresosMesRes.recordset[0] || { total_ingreso: 0, total_pagos: 0 };

    // D. Histórico de Recaudación (Últimos 12 Meses por Fecha de Abono Real)
    const historicoRes = await pool.request().query(`
      SELECT 
        YEAR(p.fecha_abono_real) AS anio,
        MONTH(p.fecha_abono_real) AS mes,
        SUM(p.monto) AS total_recaudado
      FROM dbo.rentas_pagos p
      WHERE p.activo = 1
        AND p.fecha_abono_real >= DATEADD(MONTH, -12, GETDATE())
      GROUP BY YEAR(p.fecha_abono_real), MONTH(p.fecha_abono_real)
      ORDER BY anio ASC, mes ASC;
    `);

    return {
      ocupacion: {
        total_locales: Number(o.total_locales || 0),
        locales_rentados: Number(o.locales_rentados || 0),
        locales_disponibles: Number(o.locales_disponibles || 0),
        porcentaje_ocupacion: Number(o.porcentaje_ocupacion || 0),
      },
      cartera: {
        contratos_al_corriente: contratosAlCorriente,
        contratos_con_adeudo: contratosConAdeudo,
        monto_deuda_acumulada: Number(montoDeudaAcumulada.toFixed(2)),
      },
      ingresosMesActual: {
        total_ingreso: Number(ing.total_ingreso || 0),
        total_pagos: Number(ing.total_pagos || 0),
      },
      historicoRecaudacion: historicoRes.recordset.map((r) => ({
        anio: Number(r.anio),
        mes: Number(r.mes),
        total_recaudado: Number(r.total_recaudado || 0),
      })),
    };
  }
}
