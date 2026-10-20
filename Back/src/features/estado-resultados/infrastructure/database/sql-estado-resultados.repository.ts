import mssql from "mssql";
import { dbConfig } from "../../../../config/database";
import {
  CategoriaConSubtotal,
  CrearConceptoInput,
  DesgloseConcepto,
  EgresoCategoria,
  EgresoConcepto,
  EgresoDetalleItem,
  EgresoMovimiento,
  EstadoResultadosResponse,
  ExtraDetalleItem,
  FiltrosDetalleEgresosInput,
  FiltrosDetalleExtrasInput,
  FiltrosEstadoResultadosInput,
  IEstadoResultadosRepository,
  IngresoExtraDetalle,
  IngresosDetalle,
  RegistrarEgresoInput,
  ActualizarEgresoInput,
  RegistrarProvisionIsrInput,
} from "../../domain/estado-resultados.repository";

export class SqlEstadoResultadosRepository implements IEstadoResultadosRepository {
  async obtenerEstadoResultados(
    filtros: FiltrosEstadoResultadosInput,
  ): Promise<EstadoResultadosResponse> {
    const pool = await mssql.connect(dbConfig);

    // Fechas normalizadas
    let fechaDesde = filtros.fechaDesde;
    let fechaHasta = filtros.fechaHasta;

    if (!fechaDesde || !fechaHasta) {
      const anio = filtros.anio || new Date().getFullYear();
      fechaDesde = `${anio}-01-01`;
      fechaHasta = `${anio}-12-31`;
    }

    // El periodo acumulado corre desde el 1 de Enero del año consultado hasta fechaHasta
    const anioConsulta =
      filtros.anio ||
      (fechaHasta
        ? new Date(fechaHasta).getFullYear()
        : new Date(fechaDesde).getFullYear());
    const fechaInicioAnio = `${anioConsulta}-01-01`;

    // 1. Consulta del Total de Ingresos (A partir del monto de la reserva + extras, en el periodo/mes reservado)
    const ingresosResult = await pool
      .request()
      .input("FechaDesde", mssql.Date, fechaDesde)
      .input("FechaHasta", mssql.Date, fechaHasta)
      .input("FechaInicioAnio", mssql.Date, fechaInicioAnio)
      .query(`
        WITH ReservasConTotal AS (
          SELECT 
            r.id,
            r.fecha_inicio,
            (r.monto_total + ISNULL(extras.total_extras, 0.00)) AS monto_completo
          FROM [dbo].[AAC_Alcatraz_reservaciones] r
          LEFT JOIN (
            SELECT reservacion_id, SUM(monto) AS total_extras
            FROM [dbo].[AAC_Alcatraz_reservacion_extras]
            GROUP BY reservacion_id
          ) extras ON extras.reservacion_id = r.id
          WHERE r.estado_reservacion_id NOT IN (
            SELECT id FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE LOWER(descripcion) = 'cancelado'
          )
        )
        SELECT 
          ISNULL(SUM(CASE WHEN fecha_inicio >= @FechaDesde AND fecha_inicio <= @FechaHasta THEN monto_completo ELSE 0 END), 0.00) AS TotalIngresosMensual,
          ISNULL(SUM(CASE WHEN fecha_inicio >= @FechaInicioAnio AND fecha_inicio <= @FechaHasta THEN monto_completo ELSE 0 END), 0.00) AS TotalIngresosAcumulado
        FROM ReservasConTotal
        WHERE (fecha_inicio >= @FechaDesde AND fecha_inicio <= @FechaHasta)
           OR (fecha_inicio >= @FechaInicioAnio AND fecha_inicio <= @FechaHasta);
      `);

    const totalIngresos = Number(
      ingresosResult.recordset[0]?.TotalIngresosMensual || 0,
    );
    const totalIngresosAcumulado = Number(
      ingresosResult.recordset[0]?.TotalIngresosAcumulado || 0,
    );

    // 1.1 Consulta del Desglose de Hospedajes / Reservaciones (Monto base y conteo)
    const hospedajeResult = await pool
      .request()
      .input("FechaDesde", mssql.Date, fechaDesde)
      .input("FechaHasta", mssql.Date, fechaHasta)
      .input("FechaInicioAnio", mssql.Date, fechaInicioAnio)
      .query(`
        SELECT 
          ISNULL(SUM(CASE WHEN r.fecha_inicio >= @FechaDesde AND r.fecha_inicio <= @FechaHasta THEN r.monto_total ELSE 0 END), 0.00) AS TotalHospedajeMensual,
          COUNT(CASE WHEN r.fecha_inicio >= @FechaDesde AND r.fecha_inicio <= @FechaHasta THEN r.id ELSE NULL END) AS CantidadReservasMensual,
          ISNULL(SUM(CASE WHEN r.fecha_inicio >= @FechaInicioAnio AND r.fecha_inicio <= @FechaHasta THEN r.monto_total ELSE 0 END), 0.00) AS TotalHospedajeAcumulado,
          COUNT(CASE WHEN r.fecha_inicio >= @FechaInicioAnio AND r.fecha_inicio <= @FechaHasta THEN r.id ELSE NULL END) AS CantidadReservasAcumulado
        FROM [dbo].[AAC_Alcatraz_reservaciones] r
        WHERE r.estado_reservacion_id NOT IN (
          SELECT id FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE LOWER(descripcion) = 'cancelado'
        )
        AND (
          (r.fecha_inicio >= @FechaDesde AND r.fecha_inicio <= @FechaHasta)
          OR
          (r.fecha_inicio >= @FechaInicioAnio AND r.fecha_inicio <= @FechaHasta)
        );
      `);

    const totalHospedajeMensual = Number(
      hospedajeResult.recordset[0]?.TotalHospedajeMensual || 0,
    );
    const cantidadReservasMensual = Number(
      hospedajeResult.recordset[0]?.CantidadReservasMensual || 0,
    );
    const totalHospedajeAcumulado = Number(
      hospedajeResult.recordset[0]?.TotalHospedajeAcumulado || 0,
    );
    const cantidadReservasAcumulado = Number(
      hospedajeResult.recordset[0]?.CantidadReservasAcumulado || 0,
    );

    // 1.2 Consulta de Extras Agrupados por Concepto (Filtrando saldos en cero con HAVING)
    const extrasResult = await pool
      .request()
      .input("FechaDesde", mssql.Date, fechaDesde)
      .input("FechaHasta", mssql.Date, fechaHasta)
      .input("FechaInicioAnio", mssql.Date, fechaInicioAnio)
      .query(`
        SELECT 
          ISNULL(re.concepto, 'Otros Extras') AS Concepto,
          ISNULL(SUM(CASE WHEN r.fecha_inicio >= @FechaDesde AND r.fecha_inicio <= @FechaHasta THEN re.monto ELSE 0 END), 0.00) AS TotalMensual,
          ISNULL(SUM(CASE WHEN r.fecha_inicio >= @FechaInicioAnio AND r.fecha_inicio <= @FechaHasta THEN re.monto ELSE 0 END), 0.00) AS TotalAcumulado
        FROM [dbo].[AAC_Alcatraz_reservacion_extras] re
        INNER JOIN [dbo].[AAC_Alcatraz_reservaciones] r ON r.id = re.reservacion_id
        WHERE r.estado_reservacion_id NOT IN (
          SELECT id FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE LOWER(descripcion) = 'cancelado'
        )
        GROUP BY re.concepto
        HAVING (
          ISNULL(SUM(CASE WHEN r.fecha_inicio >= @FechaDesde AND r.fecha_inicio <= @FechaHasta THEN re.monto ELSE 0 END), 0.00) > 0
          OR
          ISNULL(SUM(CASE WHEN r.fecha_inicio >= @FechaInicioAnio AND r.fecha_inicio <= @FechaHasta THEN re.monto ELSE 0 END), 0.00) > 0
        )
        ORDER BY TotalMensual DESC, TotalAcumulado DESC;
      `);

    const extrasDetalle: IngresoExtraDetalle[] = extrasResult.recordset.map(
      (row: any) => {
        const tMensual = Number(row.TotalMensual || 0);
        const tAcum = Number(row.TotalAcumulado || 0);
        return {
          concepto: String(row.Concepto).trim(),
          totalMensual: Number(tMensual.toFixed(2)),
          porcentajeSobreIngresos:
            totalIngresos > 0
              ? Number(((tMensual * 100) / totalIngresos).toFixed(2))
              : 0,
          totalAcumulado: Number(tAcum.toFixed(2)),
          porcentajeSobreIngresosAcumulado:
            totalIngresosAcumulado > 0
              ? Number(((tAcum * 100) / totalIngresosAcumulado).toFixed(2))
              : 0,
        };
      },
    );

    const ingresosDetalle: IngresosDetalle = {
      totalHospedajeMensual: Number(totalHospedajeMensual.toFixed(2)),
      cantidadReservasMensual,
      porcentajeHospedajeSobreIngresos:
        totalIngresos > 0
          ? Number(((totalHospedajeMensual * 100) / totalIngresos).toFixed(2))
          : 0,
      totalHospedajeAcumulado: Number(totalHospedajeAcumulado.toFixed(2)),
      cantidadReservasAcumulado,
      porcentajeHospedajeSobreIngresosAcumulado:
        totalIngresosAcumulado > 0
          ? Number(
              ((totalHospedajeAcumulado * 100) / totalIngresosAcumulado).toFixed(
                2,
              ),
            )
          : 0,
      extras: extrasDetalle,
      totalIngresosMensual: Number(totalIngresos.toFixed(2)),
      totalIngresosAcumulado: Number(totalIngresosAcumulado.toFixed(2)),
    };

    // 2. Consulta de Provisión de ISR (Mensual vs Acumulado)
    const isrResult = await pool
      .request()
      .input("FechaDesde", mssql.Date, fechaDesde)
      .input("FechaHasta", mssql.Date, fechaHasta)
      .input("FechaInicioAnio", mssql.Date, fechaInicioAnio)
      .query(`
        SELECT 
          ISNULL(SUM(CASE WHEN fecha_provision >= @FechaDesde AND fecha_provision <= @FechaHasta THEN monto ELSE 0 END), 0.00) AS TotalProvisionIsrMensual,
          ISNULL(SUM(CASE WHEN fecha_provision >= @FechaInicioAnio AND fecha_provision <= @FechaHasta THEN monto ELSE 0 END), 0.00) AS TotalProvisionIsrAcumulado
        FROM [dbo].[AAC_Alcatraz_provisiones_isr]
        WHERE fecha_provision >= @FechaInicioAnio AND fecha_provision <= @FechaHasta;
      `);

    let totalProvisionIsr = Number(
      isrResult.recordset[0]?.TotalProvisionIsrMensual || 0,
    );
    let totalProvisionIsrAcumulado = Number(
      isrResult.recordset[0]?.TotalProvisionIsrAcumulado || 0,
    );

    if (
      filtros.provisionIsrManual !== undefined &&
      filtros.provisionIsrManual !== null &&
      !isNaN(Number(filtros.provisionIsrManual))
    ) {
      totalProvisionIsr = Number(filtros.provisionIsrManual);
    }

    // 3. Consulta de Movimientos individuales del periodo (con descripción)
    const movimientosResult = await pool
      .request()
      .input("FechaDesde", mssql.Date, fechaDesde)
      .input("FechaHasta", mssql.Date, fechaHasta)
      .query(`
        SELECT 
          e.id,
          e.concepto_id AS ConceptoId,
          e.monto,
          CONVERT(VARCHAR(10), e.fecha_gasto, 120) AS FechaGasto,
          e.referencia_comprobante AS ReferenciaComprobante,
          ISNULL(e.descripcion, '') AS Descripcion
        FROM [dbo].[AAC_Alcatraz_egresos] e
        WHERE e.fecha_gasto >= @FechaDesde AND e.fecha_gasto <= @FechaHasta
        ORDER BY e.fecha_gasto DESC, e.id DESC;
      `);

    const movimientosMap = new Map<number, EgresoMovimiento[]>();
    for (const row of movimientosResult.recordset) {
      const cid = Number(row.ConceptoId);
      if (!movimientosMap.has(cid)) {
        movimientosMap.set(cid, []);
      }
      movimientosMap.get(cid)!.push({
        id: Number(row.id),
        conceptoId: cid,
        monto: Number(row.monto),
        fechaGasto: String(row.FechaGasto),
        referenciaComprobante: row.ReferenciaComprobante
          ? String(row.ReferenciaComprobante).trim()
          : null,
        descripcion: String(row.Descripcion).trim(),
      });
    }

    // 4. Consulta de Desglose de Gastos por Categoría y Concepto
    // Filtrando conceptos en cero (HAVING > 0) para mantener el reporte limpio
    const desgloseResult = await pool
      .request()
      .input("FechaDesde", mssql.Date, fechaDesde)
      .input("FechaHasta", mssql.Date, fechaHasta)
      .input("FechaInicioAnio", mssql.Date, fechaInicioAnio)
      .query(`
        SELECT 
          cat.id AS CategoriaId,
          cat.clave AS CategoriaClave,
          cat.nombre AS CategoriaNombre,
          cat.orden AS CategoriaOrden,
          cp.id AS ConceptoId,
          cp.nombre AS ConceptoNombre,
          ISNULL(SUM(CASE WHEN e.fecha_gasto >= @FechaDesde AND e.fecha_gasto <= @FechaHasta THEN e.monto ELSE 0 END), 0.00) AS TotalConceptoMensual,
          COUNT(CASE WHEN e.fecha_gasto >= @FechaDesde AND e.fecha_gasto <= @FechaHasta THEN e.id ELSE NULL END) AS CantidadMovimientosMensual,
          ISNULL(SUM(CASE WHEN e.fecha_gasto >= @FechaInicioAnio AND e.fecha_gasto <= @FechaHasta THEN e.monto ELSE 0 END), 0.00) AS TotalConceptoAcumulado,
          COUNT(CASE WHEN e.fecha_gasto >= @FechaInicioAnio AND e.fecha_gasto <= @FechaHasta THEN e.id ELSE NULL END) AS CantidadMovimientosAcumulado
        FROM [dbo].[AAC_Alcatraz_egreso_categorias] cat
        INNER JOIN [dbo].[AAC_Alcatraz_egreso_conceptos] cp ON cat.id = cp.categoria_id
        LEFT JOIN [dbo].[AAC_Alcatraz_egresos] e ON cp.id = e.concepto_id 
          AND e.fecha_gasto >= @FechaInicioAnio AND e.fecha_gasto <= @FechaHasta
        GROUP BY cat.id, cat.clave, cat.nombre, cat.orden, cp.id, cp.nombre
        HAVING (
          ISNULL(SUM(CASE WHEN e.fecha_gasto >= @FechaDesde AND e.fecha_gasto <= @FechaHasta THEN e.monto ELSE 0 END), 0.00) > 0
          OR
          ISNULL(SUM(CASE WHEN e.fecha_gasto >= @FechaInicioAnio AND e.fecha_gasto <= @FechaHasta THEN e.monto ELSE 0 END), 0.00) > 0
        )
        ORDER BY cat.orden ASC, TotalConceptoMensual DESC, TotalConceptoAcumulado DESC, cp.nombre ASC;
      `);

    const filasDesglose: DesgloseConcepto[] = desgloseResult.recordset.map(
      (row: any) => {
        const cId = Number(row.ConceptoId);
        const totalMensual = Number(row.TotalConceptoMensual || 0);
        const totalAcum = Number(row.TotalConceptoAcumulado || 0);

        return {
          categoriaId: Number(row.CategoriaId),
          categoriaClave: String(row.CategoriaClave).trim(),
          categoriaNombre: String(row.CategoriaNombre).trim(),
          categoriaOrden: Number(row.CategoriaOrden),
          conceptoId: cId,
          conceptoNombre: String(row.ConceptoNombre).trim(),
          totalConcepto: totalMensual,
          porcentajeSobreIngresos:
            totalIngresos > 0
              ? Number(((totalMensual * 100) / totalIngresos).toFixed(2))
              : 0,
          cantidadMovimientos: Number(row.CantidadMovimientosMensual || 0),
          totalConceptoAcumulado: totalAcum,
          porcentajeSobreIngresosAcumulado:
            totalIngresosAcumulado > 0
              ? Number(((totalAcum * 100) / totalIngresosAcumulado).toFixed(2))
              : 0,
          cantidadMovimientosAcumulado: Number(
            row.CantidadMovimientosAcumulado || 0,
          ),
          movimientos: movimientosMap.get(cId) || [],
        };
      },
    );

    // 5. Agrupamos por cada una de las 4 Categorías Base
    const categoriasMap = new Map<number, CategoriaConSubtotal>();

    // Inicializamos las categorías para asegurar las 4 base
    const categoriasCatalog = await this.obtenerCategorias();
    for (const cat of categoriasCatalog) {
      categoriasMap.set(cat.id, {
        categoriaId: cat.id,
        categoriaClave: cat.clave,
        categoriaNombre: cat.nombre,
        categoriaOrden: cat.orden,
        subtotal: 0,
        porcentajeSobreIngresos: 0,
        subtotalAcumulado: 0,
        porcentajeSobreIngresosAcumulado: 0,
        conceptos: [],
      });
    }

    let gastosVenta = 0;
    let gastosAdmin = 0;
    let gastosFinan = 0;
    let gastosSueldos = 0;

    let gastosVentaAcum = 0;
    let gastosAdminAcum = 0;
    let gastosFinanAcum = 0;
    let gastosSueldosAcum = 0;

    for (const item of filasDesglose) {
      const cat = categoriasMap.get(item.categoriaId);
      if (cat) {
        cat.conceptos.push(item);
        cat.subtotal += item.totalConcepto;
        cat.subtotalAcumulado += item.totalConceptoAcumulado;
      }

      if (item.categoriaClave === "VENTA") {
        gastosVenta += item.totalConcepto;
        gastosVentaAcum += item.totalConceptoAcumulado;
      }
      if (item.categoriaClave === "ADMINISTRACION") {
        gastosAdmin += item.totalConcepto;
        gastosAdminAcum += item.totalConceptoAcumulado;
      }
      if (item.categoriaClave === "FINANCIEROS") {
        gastosFinan += item.totalConcepto;
        gastosFinanAcum += item.totalConceptoAcumulado;
      }
      if (item.categoriaClave === "SUELDOS_SALARIOS") {
        gastosSueldos += item.totalConcepto;
        gastosSueldosAcum += item.totalConceptoAcumulado;
      }
    }

    // Calculamos % de cada subtotal sobre ingresos (Mensual y Acumulado)
    const categoriasFinales: CategoriaConSubtotal[] = Array.from(
      categoriasMap.values(),
    ).map((cat) => ({
      ...cat,
      subtotal: Number(cat.subtotal.toFixed(2)),
      porcentajeSobreIngresos:
        totalIngresos > 0
          ? Number(((cat.subtotal * 100) / totalIngresos).toFixed(2))
          : 0,
      subtotalAcumulado: Number(cat.subtotalAcumulado.toFixed(2)),
      porcentajeSobreIngresosAcumulado:
        totalIngresosAcumulado > 0
          ? Number(
              ((cat.subtotalAcumulado * 100) / totalIngresosAcumulado).toFixed(
                2,
              ),
            )
          : 0,
    }));

    categoriasFinales.sort((a, b) => a.categoriaOrden - b.categoriaOrden);

    // 6. Cálculos Financieros Finales (Mensual vs Acumulado)
    const totalGastosOperacion = Number(
      (gastosVenta + gastosAdmin + gastosFinan + gastosSueldos).toFixed(2),
    );
    const porcentajeGastosSobreIngresos =
      totalIngresos > 0
        ? Number(((totalGastosOperacion * 100) / totalIngresos).toFixed(2))
        : 0;
    const utilidadOperacion = Number(
      (totalIngresos - totalGastosOperacion).toFixed(2),
    );
    const utilidadNeta = Number(
      (utilidadOperacion - totalProvisionIsr).toFixed(2),
    );
    const porcentajeUtilidadNetaSobreIngresos =
      totalIngresos > 0
        ? Number(((utilidadNeta * 100) / totalIngresos).toFixed(2))
        : 0;

    // Acumulado
    const totalGastosOperacionAcumulado = Number(
      (
        gastosVentaAcum +
        gastosAdminAcum +
        gastosFinanAcum +
        gastosSueldosAcum
      ).toFixed(2),
    );
    const porcentajeGastosSobreIngresosAcumulado =
      totalIngresosAcumulado > 0
        ? Number(
            (
              (totalGastosOperacionAcumulado * 100) /
              totalIngresosAcumulado
            ).toFixed(2),
          )
        : 0;
    const utilidadOperacionAcumulado = Number(
      (totalIngresosAcumulado - totalGastosOperacionAcumulado).toFixed(2),
    );
    const utilidadNetaAcumulado = Number(
      (utilidadOperacionAcumulado - totalProvisionIsrAcumulado).toFixed(2),
    );
    const porcentajeUtilidadNetaSobreIngresosAcumulado =
      totalIngresosAcumulado > 0
        ? Number(
            ((utilidadNetaAcumulado * 100) / totalIngresosAcumulado).toFixed(2),
          )
        : 0;

    return {
      resumen: {
        fechaDesde,
        fechaHasta,
        fechaInicioAnio,
        // Mensual
        totalIngresos: Number(totalIngresos.toFixed(2)),
        gastosVenta: Number(gastosVenta.toFixed(2)),
        gastosAdmin: Number(gastosAdmin.toFixed(2)),
        gastosFinan: Number(gastosFinan.toFixed(2)),
        gastosSueldos: Number(gastosSueldos.toFixed(2)),
        totalGastosOperacion,
        porcentajeGastosSobreIngresos,
        utilidadOperacion,
        provisionIsr: Number(totalProvisionIsr.toFixed(2)),
        utilidadNeta,
        porcentajeUtilidadNetaSobreIngresos,
        // Acumulado
        totalIngresosAcumulado: Number(totalIngresosAcumulado.toFixed(2)),
        gastosVentaAcumulado: Number(gastosVentaAcum.toFixed(2)),
        gastosAdminAcumulado: Number(gastosAdminAcum.toFixed(2)),
        gastosFinanAcumulado: Number(gastosFinanAcum.toFixed(2)),
        gastosSueldosAcumulado: Number(gastosSueldosAcum.toFixed(2)),
        totalGastosOperacionAcumulado,
        porcentajeGastosSobreIngresosAcumulado,
        utilidadOperacionAcumulado,
        provisionIsrAcumulado: Number(totalProvisionIsrAcumulado.toFixed(2)),
        utilidadNetaAcumulado,
        porcentajeUtilidadNetaSobreIngresosAcumulado,
      },
      ingresosDetalle,
      categorias: categoriasFinales,
    };
  }

  async obtenerAniosDisponibles(): Promise<number[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT anio
      FROM (
        SELECT YEAR(fecha_inicio) AS anio FROM [dbo].[AAC_Alcatraz_reservaciones] WHERE fecha_inicio IS NOT NULL
        UNION
        SELECT YEAR(fecha_gasto) AS anio FROM [dbo].[AAC_Alcatraz_egresos] WHERE fecha_gasto IS NOT NULL
      ) AS AniosTotales
      WHERE anio IS NOT NULL AND anio >= 2000
      ORDER BY anio DESC;
    `);

    return result.recordset.map((r: any) => Number(r.anio));
  }

  async obtenerCategorias(): Promise<EgresoCategoria[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT id, clave, nombre, orden
      FROM [dbo].[AAC_Alcatraz_egreso_categorias]
      WHERE activo = 1
      ORDER BY orden ASC;
    `);

    return result.recordset.map((r: any) => ({
      id: Number(r.id),
      clave: String(r.clave).trim(),
      nombre: String(r.nombre).trim(),
      orden: Number(r.orden),
    }));
  }

  async obtenerConceptos(): Promise<EgresoConcepto[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        cp.id, 
        cp.categoria_id AS categoriaId, 
        cat.nombre AS categoriaNombre, 
        cp.nombre, 
        cp.descripcion, 
        cp.es_sistema AS esSistema
      FROM [dbo].[AAC_Alcatraz_egreso_conceptos] cp
      INNER JOIN [dbo].[AAC_Alcatraz_egreso_categorias] cat ON cp.categoria_id = cat.id
      WHERE cp.activo = 1
      ORDER BY cat.orden ASC, cp.nombre ASC;
    `);

    return result.recordset.map((r: any) => ({
      id: Number(r.id),
      categoriaId: Number(r.categoriaId),
      categoriaNombre: String(r.categoriaNombre).trim(),
      nombre: String(r.nombre).trim(),
      descripcion: r.descripcion ? String(r.descripcion).trim() : null,
      esSistema: Boolean(r.esSistema),
    }));
  }

  async crearConcepto(input: CrearConceptoInput): Promise<EgresoConcepto> {
    const pool = await mssql.connect(dbConfig);

    const existente = await pool
      .request()
      .input("CategoriaId", mssql.TinyInt, input.categoriaId)
      .input("Nombre", mssql.VarChar(150), input.nombre)
      .query(`
        SELECT cp.id, cp.categoria_id AS categoriaId, cat.nombre AS categoriaNombre, cp.nombre, cp.descripcion, cp.es_sistema AS esSistema
        FROM [dbo].[AAC_Alcatraz_egreso_conceptos] cp
        INNER JOIN [dbo].[AAC_Alcatraz_egreso_categorias] cat ON cp.categoria_id = cat.id
        WHERE cp.categoria_id = @CategoriaId AND LOWER(LTRIM(RTRIM(cp.nombre))) = LOWER(LTRIM(RTRIM(@Nombre)));
      `);

    if (existente.recordset.length > 0) {
      const r = existente.recordset[0];
      return {
        id: Number(r.id),
        categoriaId: Number(r.categoriaId),
        categoriaNombre: String(r.categoriaNombre).trim(),
        nombre: String(r.nombre).trim(),
        descripcion: r.descripcion,
        esSistema: Boolean(r.esSistema),
      };
    }

    const insertResult = await pool
      .request()
      .input("CategoriaId", mssql.TinyInt, input.categoriaId)
      .input("Nombre", mssql.VarChar(150), input.nombre)
      .input("Descripcion", mssql.VarChar(255), input.descripcion || null)
      .input("UsuarioId", mssql.Int, input.usuarioId)
      .query(`
        INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] 
          (categoria_id, nombre, descripcion, es_sistema, activo, user_create_id, created_at)
        OUTPUT INSERTED.id
        VALUES (@CategoriaId, @Nombre, @Descripcion, 0, 1, @UsuarioId, GETDATE());
      `);

    const nuevoId = insertResult.recordset[0]?.id;

    const catResult = await pool
      .request()
      .input("Id", mssql.TinyInt, input.categoriaId)
      .query(`SELECT nombre FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE id = @Id;`);

    return {
      id: Number(nuevoId),
      categoriaId: input.categoriaId,
      categoriaNombre: catResult.recordset[0]?.nombre?.trim() || "",
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      esSistema: false,
    };
  }

  async registrarEgreso(
    input: RegistrarEgresoInput,
  ): Promise<{ id: number; message: string }> {
    const pool = await mssql.connect(dbConfig);
    const desc = input.descripcion || input.observaciones || "";

    const result = await pool
      .request()
      .input("ConceptoId", mssql.Int, input.conceptoId)
      .input("Monto", mssql.Money, input.monto)
      .input("FechaGasto", mssql.Date, input.fechaGasto)
      .input(
        "Referencia",
        mssql.VarChar(100),
        input.referenciaComprobante || null,
      )
      .input("Descripcion", mssql.VarChar(500), desc)
      .input("OrigenDineroId", mssql.Int, input.origenDineroId || null)
      .input("UsuarioId", mssql.Int, input.usuarioId)
      .query(`
        INSERT INTO [dbo].[AAC_Alcatraz_egresos] 
          (concepto_id, monto, fecha_gasto, referencia_comprobante, descripcion, origen_dinero_id, user_create_id, created_at)
        OUTPUT INSERTED.id
        VALUES (@ConceptoId, @Monto, @FechaGasto, @Referencia, @Descripcion, @OrigenDineroId, @UsuarioId, GETDATE());
      `);

    const id = result.recordset[0]?.id;
    return {
      id: Number(id),
      message: "Gasto registrado exitosamente.",
    };
  }

  async actualizarEgreso(
    input: ActualizarEgresoInput,
  ): Promise<{ id: number; message: string }> {
    const pool = await mssql.connect(dbConfig);
    const transaction = new mssql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Obtener el estado previo del egreso para la bitácora
      const previoResult = await transaction
        .request()
        .input("Id", mssql.Int, input.id)
        .query(`
          SELECT 
            e.id,
            e.concepto_id AS conceptoId,
            cp.nombre AS conceptoNombre,
            e.monto,
            e.fecha_gasto AS fechaGasto,
            e.referencia_comprobante AS referenciaComprobante,
            e.descripcion,
            e.origen_dinero_id AS origenDineroId
          FROM [dbo].[AAC_Alcatraz_egresos] e
          LEFT JOIN [dbo].[AAC_Alcatraz_egreso_conceptos] cp ON e.concepto_id = cp.id
          WHERE e.id = @Id;
        `);

      if (previoResult.recordset.length === 0) {
        throw new Error(`El egreso con ID ${input.id} no fue encontrado.`);
      }

      const anterior = previoResult.recordset[0];

      // 2. Obtener el nombre del usuario editor si no fue provisto
      let usuarioNombre = (input.usuarioNombre || "").trim();
      if (!usuarioNombre) {
        const userResult = await transaction
          .request()
          .input("UsuarioId", mssql.Int, input.usuarioId)
          .query(`SELECT [user] FROM [dbo].[AAC_Alcatraz_usuarios] WHERE id = @UsuarioId;`);

        if (userResult.recordset.length > 0 && userResult.recordset[0]?.user) {
          usuarioNombre = String(userResult.recordset[0].user).trim();
        } else {
          usuarioNombre = `Usuario #${input.usuarioId}`;
        }
      }

      // 3. Comparar cambios detallados para la bitácora
      const cambios: Array<{
        campo: string;
        valorAnterior: any;
        valorNuevo: any;
      }> = [];

      if (Number(anterior.conceptoId) !== Number(input.conceptoId)) {
        cambios.push({
          campo: "concepto_id",
          valorAnterior: Number(anterior.conceptoId),
          valorNuevo: Number(input.conceptoId),
        });
      }

      if (Number(anterior.monto) !== Number(input.monto)) {
        cambios.push({
          campo: "monto",
          valorAnterior: Number(anterior.monto),
          valorNuevo: Number(input.monto),
        });
      }

      const fechaAntStr = anterior.fechaGasto instanceof Date
        ? anterior.fechaGasto.toISOString().split("T")[0]
        : String(anterior.fechaGasto).split("T")[0];
      const fechaNuevaStr = input.fechaGasto instanceof Date
        ? input.fechaGasto.toISOString().split("T")[0]
        : String(input.fechaGasto).split("T")[0];

      if (fechaAntStr !== fechaNuevaStr) {
        cambios.push({
          campo: "fecha_gasto",
          valorAnterior: fechaAntStr,
          valorNuevo: fechaNuevaStr,
        });
      }

      const refAnt = anterior.referenciaComprobante
        ? String(anterior.referenciaComprobante).trim()
        : null;
      const refNueva = input.referenciaComprobante
        ? String(input.referenciaComprobante).trim()
        : null;

      if (refAnt !== refNueva) {
        cambios.push({
          campo: "referencia_comprobante",
          valorAnterior: refAnt,
          valorNuevo: refNueva,
        });
      }

      const descAnt = anterior.descripcion
        ? String(anterior.descripcion).trim()
        : "";
      const descNueva = input.descripcion.trim();

      if (descAnt !== descNueva) {
        cambios.push({
          campo: "descripcion",
          valorAnterior: descAnt,
          valorNuevo: descNueva,
        });
      }

      const resumenCambios = cambios.length > 0
        ? cambios.map((c) => `${c.campo}: '${c.valorAnterior}' -> '${c.valorNuevo}'`).join("; ")
        : "Sin modificaciones en los campos principales";

      const datosModificadosJson = JSON.stringify({
        resumen: resumenCambios,
        cambios,
        registroAnterior: {
          conceptoId: anterior.conceptoId,
          monto: anterior.monto,
          fechaGasto: fechaAntStr,
          referenciaComprobante: refAnt,
          descripcion: descAnt,
        },
        registroNuevo: {
          conceptoId: input.conceptoId,
          monto: input.monto,
          fechaGasto: fechaNuevaStr,
          referenciaComprobante: refNueva,
          descripcion: descNueva,
        },
      });

      // 4. Actualizar el egreso en SQL Server 2008 R2
      await transaction
        .request()
        .input("Id", mssql.Int, input.id)
        .input("ConceptoId", mssql.Int, input.conceptoId)
        .input("Monto", mssql.Money, input.monto)
        .input("FechaGasto", mssql.Date, input.fechaGasto)
        .input("Referencia", mssql.VarChar(100), refNueva)
        .input("Descripcion", mssql.VarChar(500), descNueva)
        .input("OrigenDineroId", mssql.Int, input.origenDineroId || null)
        .input("UsuarioId", mssql.Int, input.usuarioId)
        .query(`
          UPDATE [dbo].[AAC_Alcatraz_egresos]
          SET 
            concepto_id = @ConceptoId,
            monto = @Monto,
            fecha_gasto = @FechaGasto,
            referencia_comprobante = @Referencia,
            descripcion = @Descripcion,
            origen_dinero_id = @OrigenDineroId,
            user_update_id = @UsuarioId,
            updated_at = GETDATE()
          WHERE id = @Id;
        `);

      // 5. Insertar el registro detallado en la bitácora
      await transaction
        .request()
        .input("EgresoId", mssql.Int, input.id)
        .input("Accion", mssql.VarChar(50), "EDICION")
        .input("DatosModificados", mssql.VarChar(mssql.MAX), datosModificadosJson)
        .input("UsuarioId", mssql.Int, input.usuarioId)
        .input("UsuarioNombre", mssql.VarChar(100), usuarioNombre)
        .query(`
          INSERT INTO [dbo].[AAC_Alcatraz_bitacora_egresos]
            (egreso_id, accion, datos_modificados, usuario_id, usuario_nombre, fecha_modificacion)
          VALUES
            (@EgresoId, @Accion, @DatosModificados, @UsuarioId, @UsuarioNombre, GETDATE());
        `);

      await transaction.commit();

      return {
        id: input.id,
        message: "Egreso actualizado y registrado en bitácora exitosamente.",
      };
    } catch (error) {
      try {
        await transaction.rollback();
      } catch {
        // Rollback silencioso si la transacción ya no está activa
      }
      throw new Error(`[Repository] Error al actualizar el egreso: ${(error as Error).message}`);
    }
  }

  async registrarProvisionIsr(
    input: RegistrarProvisionIsrInput,
  ): Promise<{ id: number; message: string }> {
    const pool = await mssql.connect(dbConfig);

    const result = await pool
      .request()
      .input("FechaProvision", mssql.Date, input.fechaProvision)
      .input("EjercicioAno", mssql.SmallInt, input.ejercicioAno)
      .input("PeriodoMes", mssql.TinyInt, input.periodoMes || null)
      .input("Monto", mssql.Money, input.monto)
      .input("Observaciones", mssql.VarChar(255), input.observaciones || null)
      .input("UsuarioId", mssql.Int, input.usuarioId)
      .query(`
        INSERT INTO [dbo].[AAC_Alcatraz_provisiones_isr]
          (fecha_provision, ejercicio_ano, periodo_mes, monto, observaciones, user_create_id, created_at)
        OUTPUT INSERTED.id
        VALUES (@FechaProvision, @EjercicioAno, @PeriodoMes, @Monto, @Observaciones, @UsuarioId, GETDATE());
      `);

    const id = result.recordset[0]?.id;
    return {
      id: Number(id),
      message: "Provisión de ISR registrada exitosamente.",
    };
  }

  async obtenerUltimosEgresos(limite = 10): Promise<any[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Limite", mssql.Int, limite)
      .query(`
        SELECT TOP (@Limite)
          e.id, 
          e.monto, 
          CONVERT(VARCHAR(10), e.fecha_gasto, 120) AS fechaGasto, 
          e.referencia_comprobante AS referenciaComprobante, 
          ISNULL(e.descripcion, '') AS descripcion,
          cp.id AS conceptoId,
          cp.nombre AS conceptoNombre,
          cat.id AS categoriaId,
          cat.nombre AS categoriaNombre
        FROM [dbo].[AAC_Alcatraz_egresos] e
        INNER JOIN [dbo].[AAC_Alcatraz_egreso_conceptos] cp ON e.concepto_id = cp.id
        INNER JOIN [dbo].[AAC_Alcatraz_egreso_categorias] cat ON cp.categoria_id = cat.id
        ORDER BY e.fecha_gasto DESC, e.id DESC;
      `);

    return result.recordset.map((r: any) => ({
      id: Number(r.id),
      monto: Number(r.monto),
      fechaGasto: r.fechaGasto,
      referenciaComprobante: r.referenciaComprobante,
      descripcion: r.descripcion,
      conceptoId: Number(r.conceptoId),
      conceptoNombre: String(r.conceptoNombre).trim(),
      categoriaId: Number(r.categoriaId),
      categoriaNombre: String(r.categoriaNombre).trim(),
    }));
  }

  async obtenerDetalleEgresos(
    filtros: FiltrosDetalleEgresosInput,
  ): Promise<EgresoDetalleItem[]> {
    const pool = await mssql.connect(dbConfig);

    let fechaDesde = filtros.fechaDesde || null;
    let fechaHasta = filtros.fechaHasta || null;

    if (!fechaDesde && !fechaHasta && filtros.anio) {
      fechaDesde = `${filtros.anio}-01-01`;
      fechaHasta = `${filtros.anio}-12-31`;
    }

    const request = pool.request();

    if (filtros.categoriaId) {
      request.input("CategoriaId", mssql.Int, filtros.categoriaId);
    }
    if (filtros.conceptoId) {
      request.input("ConceptoId", mssql.Int, filtros.conceptoId);
    }
    if (fechaDesde) {
      request.input("FechaDesde", mssql.Date, fechaDesde);
    }
    if (fechaHasta) {
      request.input("FechaHasta", mssql.Date, fechaHasta);
    }

    const query = `
      SELECT 
        e.id, 
        e.monto, 
        CONVERT(VARCHAR(10), e.fecha_gasto, 120) AS fechaGasto, 
        e.referencia_comprobante AS referenciaComprobante, 
        ISNULL(e.descripcion, '') AS descripcion,
        cp.id AS conceptoId,
        cp.nombre AS conceptoNombre,
        cat.id AS categoriaId,
        cat.nombre AS categoriaNombre
      FROM [dbo].[AAC_Alcatraz_egresos] e
      INNER JOIN [dbo].[AAC_Alcatraz_egreso_conceptos] cp ON e.concepto_id = cp.id
      INNER JOIN [dbo].[AAC_Alcatraz_egreso_categorias] cat ON cp.categoria_id = cat.id
      WHERE 1 = 1
        ${filtros.categoriaId ? "AND cat.id = @CategoriaId" : ""}
        ${filtros.conceptoId ? "AND cp.id = @ConceptoId" : ""}
        ${fechaDesde ? "AND e.fecha_gasto >= @FechaDesde" : ""}
        ${fechaHasta ? "AND e.fecha_gasto <= @FechaHasta" : ""}
      ORDER BY e.fecha_gasto DESC, e.id DESC;
    `;

    const result = await request.query(query);

    return result.recordset.map((r: any) => ({
      id: Number(r.id),
      monto: Number(r.monto),
      fechaGasto: String(r.fechaGasto),
      referenciaComprobante: r.referenciaComprobante ? String(r.referenciaComprobante).trim() : null,
      descripcion: String(r.descripcion).trim(),
      conceptoId: Number(r.conceptoId),
      conceptoNombre: String(r.conceptoNombre).trim(),
      categoriaId: Number(r.categoriaId),
      categoriaNombre: String(r.categoriaNombre).trim(),
    }));
  }

  async obtenerDetalleExtras(
    filtros: FiltrosDetalleExtrasInput,
  ): Promise<ExtraDetalleItem[]> {
    const pool = await mssql.connect(dbConfig);

    let fechaDesde = filtros.fechaDesde || null;
    let fechaHasta = filtros.fechaHasta || null;

    if (!fechaDesde && !fechaHasta && filtros.anio) {
      fechaDesde = `${filtros.anio}-01-01`;
      fechaHasta = `${filtros.anio}-12-31`;
    }

    const request = pool.request();

    if (filtros.concepto) {
      request.input("Concepto", mssql.VarChar(100), filtros.concepto);
    }
    if (fechaDesde) {
      request.input("FechaDesde", mssql.Date, fechaDesde);
    }
    if (fechaHasta) {
      request.input("FechaHasta", mssql.Date, fechaHasta);
    }

    const query = `
      SELECT 
        re.id,
        re.reservacion_id AS reservacionId,
        re.concepto,
        re.monto,
        ISNULL(re.cantidad, 1) AS cantidad,
        ISNULL(re.dias, 1) AS dias,
        ISNULL(re.precio_unitario_noche, re.monto) AS precioUnitarioNoche,
        ISNULL(re.porcentaje_comision, 0) AS porcentajeComision,
        ISNULL(re.monto_comision, 0) AS montoComision,
        re.tipo_evento AS tipoEvento,
        CONVERT(VARCHAR(10), r.fecha_inicio, 120) AS fechaInicioReserva,
        CONVERT(VARCHAR(10), r.fecha_fin, 120) AS fechaFinReserva,
        (ISNULL(c.nombre, '') + ' ' + ISNULL(c.apellido, '')) AS clienteNombre,
        ISNULL(o.nombre, '') AS origenReserva
      FROM [dbo].[AAC_Alcatraz_reservacion_extras] re
      INNER JOIN [dbo].[AAC_Alcatraz_reservaciones] r ON re.reservacion_id = r.id
      LEFT JOIN [dbo].[AAC_Alcatraz_clientes] c ON r.cliente_id = c.id
      LEFT JOIN [dbo].[AAC_Alcatraz_origen_reserva] o ON r.origen_reserva_id = o.id
      WHERE r.estado_reservacion_id NOT IN (
        SELECT id FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE LOWER(descripcion) = 'cancelado'
      )
      ${filtros.concepto ? "AND re.concepto = @Concepto" : ""}
      ${fechaDesde ? "AND r.fecha_inicio >= @FechaDesde" : ""}
      ${fechaHasta ? "AND r.fecha_inicio <= @FechaHasta" : ""}
      ORDER BY r.fecha_inicio DESC, re.id DESC;
    `;

    const result = await request.query(query);

    return result.recordset.map((r: any) => ({
      id: Number(r.id),
      reservacionId: Number(r.reservacionId),
      concepto: String(r.concepto).trim(),
      monto: Number(r.monto),
      cantidad: Number(r.cantidad || 1),
      dias: Number(r.dias || 1),
      precioUnitarioNoche: Number(r.precioUnitarioNoche || 0),
      porcentajeComision: Number(r.porcentajeComision || 0),
      montoComision: Number(r.montoComision || 0),
      tipoEvento: r.tipoEvento ? String(r.tipoEvento).trim() : null,
      fechaInicioReserva: String(r.fechaInicioReserva),
      fechaFinReserva: String(r.fechaFinReserva),
      clienteNombre: String(r.clienteNombre).trim(),
      origenReserva: String(r.origenReserva).trim(),
    }));
  }

  async obtenerConceptosExtras(): Promise<string[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT concepto 
      FROM [dbo].[AAC_Alcatraz_reservacion_extras] 
      WHERE concepto IS NOT NULL AND LTRIM(RTRIM(concepto)) <> ''
      ORDER BY concepto ASC;
    `);

    return result.recordset.map((r: any) => String(r.concepto).trim());
  }
}
