import mssql from "mssql";
import { parseStringPromise } from "xml2js"; // 🆕 Convertidor nativo XML a JSON
import {
  IReporteRepository,
  FiltrosReporteDto,
  ReporteFinancieroEntity,
  BitacoraBorrado,
  ExtraEliminado,
} from "../../domain/reportes.repository";
import { dbConfig } from "../../../../config/database";

export class SqlServerReporteRepository implements IReporteRepository {
  async obtenerReporteGeneral(
    filtros: FiltrosReporteDto,
  ): Promise<ReporteFinancieroEntity[]> {
    let pool;

    try {
      pool = await mssql.connect(dbConfig);

      const resultado = await pool
        .request()
        .input("FechaDesde", mssql.Date, filtros.fechaDesde || null)
        .input("FechaHasta", mssql.Date, filtros.fechaHasta || null)
        .input("EstatusId", mssql.Int, filtros.estatusId || null)
        .execute("dbo.AAC_Alcatraz_Reporte_General_Reservaciones");

      const reportesFormateados = await Promise.all(
        resultado.recordset.map(async (registro: any) => {
          let listaDesglosada: any[] = [];

          if (registro.desglosesXml) {
            try {
              // Parseamos el string XML devuelto por SQL Server 2008 R2
              const xmlParseado = await parseStringPromise(
                registro.desglosesXml,
                { explicitArray: false },
              );

              if (
                xmlParseado &&
                xmlParseado.extras &&
                xmlParseado.extras.extra
              ) {
                const nodosExtra = xmlParseado.extras.extra;
                const arrExtras = Array.isArray(nodosExtra)
                  ? nodosExtra
                  : [nodosExtra];

                listaDesglosada = arrExtras.map((e: any) => ({
                  id: Number(e.id),
                  concepto: String(e.concepto),
                  tipoEvento: e.tipoEvento ? String(e.tipoEvento) : "",
                  cantidad: Number(e.cantidad),
                  dias: Number(e.dias),
                  precioUnitarioNoche: Number(e.precioUnitarioNoche),
                  monto: Number(e.monto),
                  porcentajeComision: Number(e.porcentajeComision),
                  montoComision: Number(e.montoComision),
                }));
              }
            } catch (xmlError) {
              console.error(
                "Error parseando el XML de extras individuales:",
                xmlError,
              );
            }
          }

          // Retornamos el objeto final limpio combinando los datos
          return {
            numeroReserva: registro.numeroReserva,
            cliente: registro.cliente,
            fechaInicio: registro.fechaInicio,
            fechaFin: registro.fechaFin,
            numeroHuespedes: registro.numeroHuespedes,
            totalNoches: Number(registro.totalNoches || 0),
            plataforma: registro.plataforma,
            costoPorNoche: registro.costoPorNoche,
            costoTotalReservacion: registro.costoTotalReservacion,
            serviciosExtras: registro.serviciosExtras,

            desgloseExtras: listaDesglosada, // 🚀 Aquí vive el arreglo real listo para Postman/React

            totalEstancia: registro.totalEstancia,
            montoComisionPlataforma: registro.montoComisionPlataforma,
            pagosRecibidos: registro.pagosRecibidos,
            montoPendientePago: registro.montoPendientePago,
            depositoGarantia: registro.depositoGarantia,
            estatus: registro.estatus,
          } as ReporteFinancieroEntity;
        }),
      );

      return reportesFormateados;
    } catch (error) {
      throw error;
    }
  }
  async obtenerBitacoraBorrado(): Promise<BitacoraBorrado[]> {
    let pool;

    try {
      pool = await mssql.connect(dbConfig);

      // 1. Consulta de bitácora histórica de reservaciones y pagos (almacenada en XML)
      const queryBorrados = `
        SELECT 
          b.id,
          b.tabla_afectada,
          b.registro_id,
          b.usuario_id,
          u.[user] AS usuario_nombre,
          b.fecha_borrado,
          b.datos_eliminados,
          b.accion
        FROM [AAC_Alcatraz_bitacora_borrado] b
        LEFT JOIN [AAC_Alcatraz_usuarios] u ON u.id = b.usuario_id
        ORDER BY b.fecha_borrado DESC;
      `;

      // 2. Consulta de bitácora de auditoría de egresos (almacenada en JSON con usuario y diff)
      const queryEgresos = `
        SELECT 
          be.id,
          be.egreso_id,
          be.accion,
          be.datos_modificados,
          be.usuario_id,
          be.usuario_nombre,
          be.fecha_modificacion,
          cp.nombre AS concepto_nombre
        FROM [AAC_Alcatraz_bitacora_egresos] be
        LEFT JOIN [AAC_Alcatraz_egresos] e ON e.id = be.egreso_id
        LEFT JOIN [AAC_Alcatraz_egreso_conceptos] cp ON cp.id = e.concepto_id
        ORDER BY be.fecha_modificacion DESC;
      `;

      const [resultadoBorrados, resultadoEgresos] = await Promise.all([
        pool.request().query(queryBorrados),
        pool.request().query(queryEgresos),
      ]);

      const itemsBorrados: BitacoraBorrado[] = await Promise.all(
        resultadoBorrados.recordset.map(async (registro: any) => {
          let montoTotal: number | undefined;
          let fechaInicio: string | undefined;
          let fechaFin: string | undefined;
          let clienteNombre: string | undefined;
          let listaExtras: ExtraEliminado[] = [];

          if (registro.datos_eliminados) {
            try {
              const xmlParseado = await parseStringPromise(
                registro.datos_eliminados,
                { explicitArray: false },
              );

              if (xmlParseado && xmlParseado.registro) {
                const reg = xmlParseado.registro;

                montoTotal = reg.monto_total
                  ? Number(reg.monto_total)
                  : undefined;
                fechaInicio = reg.fecha_inicio
                  ? String(reg.fecha_inicio)
                  : undefined;
                fechaFin = reg.fecha_fin ? String(reg.fecha_fin) : undefined;
                clienteNombre = reg.cliente_nombre
                  ? String(reg.cliente_nombre)
                  : undefined;

                if (reg.extras_solicitados && reg.extras_solicitados.extra) {
                  const nodosExtra = reg.extras_solicitados.extra;
                  const arrExtras = Array.isArray(nodosExtra)
                    ? nodosExtra
                    : [nodosExtra];

                  listaExtras = arrExtras.map((e: any) => ({
                    id: Number(e.id),
                    concepto: String(e.concepto),
                    monto: Number(e.monto),
                    cantidad: Number(e.cantidad),
                    dias: Number(e.dias),
                    precioNoche: Number(e.precio_noche),
                  }));
                }
              }
            } catch (xmlError) {
              console.error("Error parseando XML de bitácora:", xmlError);
            }
          }

          return {
            id: registro.id,
            tablaAfectada: registro.tabla_afectada,
            registroId: registro.registro_id,
            usuarioId: registro.usuario_nombre
              ? String(registro.usuario_nombre)
              : (registro.usuario_id ? String(registro.usuario_id) : "Desconocido"),
            fechaBorrado: registro.fecha_borrado,
            accion: registro.accion,
            detalles: {
              montoTotal,
              fechaInicio,
              fechaFin,
              clienteNombre,
              extras: listaExtras,
            },
          } as BitacoraBorrado;
        }),
      );

      const itemsEgresos: BitacoraBorrado[] = resultadoEgresos.recordset.map((reg: any) => {
        let datosModificados: any = {};
        if (reg.datos_modificados) {
          try {
            datosModificados =
              typeof reg.datos_modificados === "string"
                ? JSON.parse(reg.datos_modificados)
                : reg.datos_modificados;
          } catch (e) {
            console.error("Error parseando datos_modificados de egreso:", e);
          }
        }

        const registroNuevo = datosModificados.registroNuevo || {};
        const registroAnterior = datosModificados.registroAnterior || {};

        return {
          id: `egr-${reg.id}`,
          tablaAfectada: "AAC_Alcatraz_egresos",
          registroId: Number(reg.egreso_id),
          usuarioId: reg.usuario_nombre || (reg.usuario_id ? String(reg.usuario_id) : "Desconocido"),
          fechaBorrado: reg.fecha_modificacion,
          accion: (reg.accion || "EDICION") as "EDICION",
          detalles: {
            montoTotal: registroNuevo.monto !== undefined ? Number(registroNuevo.monto) : undefined,
            fechaInicio: registroNuevo.fechaGasto || registroAnterior.fechaGasto,
            clienteNombre: reg.concepto_nombre ? `Concepto: ${reg.concepto_nombre}` : undefined,
            concepto: reg.concepto_nombre,
            descripcion: registroNuevo.descripcion || registroAnterior.descripcion,
            referenciaComprobante: registroNuevo.referenciaComprobante || registroAnterior.referenciaComprobante,
            resumen: datosModificados.resumen,
            cambios: datosModificados.cambios || [],
          },
        } as BitacoraBorrado;
      });

      // Combinamos ambas fuentes y ordenamos cronológicamente descendente
      const combinados = [...itemsBorrados, ...itemsEgresos];
      combinados.sort((a, b) => {
        const timeA = new Date(a.fechaBorrado).getTime();
        const timeB = new Date(b.fechaBorrado).getTime();
        return timeB - timeA;
      });

      return combinados;
    } catch (error) {
      throw error;
    }
  }
}
