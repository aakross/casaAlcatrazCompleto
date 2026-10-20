import { useState, Fragment } from "react";
import { type FilaReporteFinanciero } from "../../domain/reportes.repository";

interface TablaExcelReporteProps {
  filas: FilaReporteFinanciero[];
}

export const TablaExcelReporte = ({ filas }: TablaExcelReporteProps) => {
  const [filasExpandidas, setFilasExpandidas] = useState<
    Record<number, boolean>
  >({});

  const toggleFila = (numeroReserva: number) => {
    setFilasExpandidas((prev) => ({
      ...prev,
      [numeroReserva]: !prev[numeroReserva],
    }));
  };
  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(monto || 0);
  };

  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return "-";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const obtenerEstiloPlataforma = (plataforma: string) => {
    const p = plataforma.trim().toLowerCase();
    if (p.includes("airbnb")) return "bg-red-50 text-red-600 border-red-200";
    if (p.includes("booking"))
      return "bg-blue-50 text-blue-600 border-blue-200";

    // 🎯 REEMPLAZADO: Cambiamos OhSunny por tu color secundario dorado elegante (--color-secondary)
    return "bg-secondary/10 text-secondary border-secondary/20";
  };

  if (filas.length === 0) {
    return (
      <div className="text-center p-12 bg-surfacecontainer rounded-xl text-surface font-body italic border border-black/5">
        No se encontraron registros financieros para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-black/5 shadow-sm bg-white">
      <table className="w-full text-left text-xs border-collapse min-w-[1300px]">
        <thead>
          <tr className="bg-primary text-secondary uppercase font-label font-bold tracking-wider text-[10px] border-b border-black/10">
            {/* 🆕 Nueva columna para la flecha indicadora */}
            <th className="p-4 text-center w-12"></th>
            <th className="p-4 text-center w-16">Folio</th>
            <th className="p-4 min-w-[180px]">Huésped / Cliente</th>
            <th className="p-4 text-center">Plataforma</th>
            <th className="p-4 text-center">Num. Huespedes</th>
            <th className="p-4 text-center">Rango de Estancia</th>
            <th className="p-4 text-center">Noches</th>
            <th className="p-4 text-right">Precio Noche</th>
            <th className="p-4 text-right">Hospedaje Bruto</th>
            <th className="p-4 text-right text-ohsunny">Comisión</th>
            <th className="p-4 text-right">Extras</th>
            <th className="p-4 text-right bg-primary/5 ">Total Estancia</th>
            <th className="p-4 text-right  ">Abonado</th>
            <th className="p-4 text-center">Estatus Cuenta</th>
            <th className="p-4 text-right">Garantía</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-body text-neutral font-medium">
          {filas.map((fila) => {
            const esLiquidado =
              fila.montoPendientePago <= 0 || fila.estatus === "Finalizado";

            // 🆕 Constantes para evaluar el despliegue del acordeón
            const estaExpandido = !!filasExpandidas[fila.numeroReserva];
            const tieneExtras =
              fila.desgloseExtras && fila.desgloseExtras.length > 0;

            return (
              // 🆕 Envolvemos en un Fragment para poder meter la sub-tabla abajo del tr
              <Fragment key={fila.numeroReserva}>
                <tr
                  className={`transition-colors odd:bg-white even:bg-surfacecontainer/40 ${
                    tieneExtras
                      ? "cursor-pointer hover:bg-primary/5"
                      : "hover:bg-primary/5"
                  } ${estaExpandido ? "bg-primary/5 font-semibold" : ""}`}
                  // 🆕 Si tiene extras, al dar clic en la fila se expande el desglose
                  onClick={() => tieneExtras && toggleFila(fila.numeroReserva)}
                >
                  {/* 🆕 Celda del indicador visual (Flecha) */}
                  <td className="p-4 text-center text-gray-400 font-bold select-none text-sm">
                    {tieneExtras ? (
                      estaExpandido ? (
                        "▼"
                      ) : (
                        "▶"
                      )
                    ) : (
                      <span className="text-gray-200">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center font-bold text-gray-400">
                    #{fila.numeroReserva}
                  </td>
                  <td className="p-4 font-bold text-primary text-sm">
                    {fila.cliente}
                  </td>

                  {/* 🌟 Nueva Celda: Plataforma */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${obtenerEstiloPlataforma(fila.plataforma)}`}
                    >
                      {fila.plataforma.trim()}
                    </span>
                  </td>

                  {/* 🌟 Nueva Celda: Pax (Número de huéspedes) */}
                  <td className="p-4 text-center font-bold text-gray-600">
                    {fila.numeroHuespedes}
                  </td>

                  <td className="p-4 text-center text-gray-500 text-[11px]">
                    {formatearFecha(fila.fechaInicio)} -{" "}
                    {formatearFecha(fila.fechaFin)}
                  </td>
                  <td className="p-4 text-center font-bold text-gray-700 bg-gray-50/40">
                    {fila.totalNoches}
                  </td>
                  <td className="p-4 text-right">
                    {formatearMoneda(fila.costoPorNoche)}
                  </td>
                  <td className="p-4 text-right text-gray-600">
                    {formatearMoneda(fila.costoTotalReservacion)}
                  </td>
                  <td className="p-4 text-right text-ohsunny font-semibold">
                    {fila.montoComisionPlataforma > 0
                      ? `-${formatearMoneda(fila.montoComisionPlataforma)}`
                      : "$0.00"}
                  </td>
                  <td className="p-4 text-right text-purple-800">
                    {fila.serviciosExtras > 0
                      ? `+${formatearMoneda(fila.serviciosExtras)}`
                      : "$0.00"}
                  </td>

                  {/* Gran Total Estancia */}
                  <td className="p-4 text-right font-black bg-primary/5 text-primary text-sm">
                    {formatearMoneda(fila.totalEstancia)}
                  </td>

                  {/* Pagos Recibidos */}
                  <td className="p-4 text-right text-emerald-700 font-bold bg-emerald-50/20">
                    {formatearMoneda(fila.pagosRecibidos)}
                  </td>

                  {/* Balance / Estado de Cuenta Dinámico */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        esLiquidado
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {esLiquidado
                        ? "💰 Liquidado"
                        : `Debe ${formatearMoneda(fila.montoPendientePago)}`}
                    </span>
                  </td>

                  <td className="p-4 text-right text-gray-500 font-semibold">
                    {formatearMoneda(fila.depositoGarantia)}
                  </td>
                </tr>

                {/* 🌟 4. SUB-FILA DESPLEGABLE: Renderiza la tabla de desgloses de extras vinculados */}

                {estaExpandido && tieneExtras && (
                  // Reemplazamos border-ohsunny por tu color dorado de marca (border-secondary/60)
                  <tr className="bg-surfacecontainer/20 border-l-4 border-secondary/60 animate-fadeIn">
                    {/* Colspan 14 para cubrir la anchura total de la rejilla superior */}
                    <td colSpan={14} className="p-5">
                      <div className="w-full bg-white rounded-lg border border-black/5 p-4 shadow-inner">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1 font-label">
                          Desglose de Servicios Extras en Estancia
                        </div>

                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] border-b border-black/5 font-label">
                              <th className="p-2.5">Concepto</th>
                              <th className="p-2.5 text-left">
                                Detalle Evento
                              </th>{" "}
                              {/* 🆕 Nueva cabecera */}
                              <th className="p-2.5 text-center">
                                Invitados
                              </th>{" "}
                              {/* 🆕 Nueva cabecera */}
                              <th className="p-2.5 text-center">Cant.</th>
                              <th className="p-2.5 text-center">Días</th>
                              <th className="p-2.5 text-right">
                                Precio x Noche
                              </th>
                              <th className="p-2.5 text-center">Comis. (%)</th>
                              <th className="p-2.5 text-right text-error">
                                Monto Comis.
                              </th>
                              <th className="p-2.5 text-right font-bold text-gray-700">
                                Subtotal
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100 font-medium text-gray-600 font-body">
                            {fila.desgloseExtras.map((extra) => {
                              // 🔬 EXTRACCIÓN INTELIGENTE DE DATOS:
                              // Leemos la cadena "Boda2 - 50 personas" que destapamos en Node y viaja en la interfaz
                              const stringCompleto = extra.tipoEvento || "";

                              const [nombreDelEvento, textoHuespedes] =
                                stringCompleto.includes(" - ")
                                  ? stringCompleto.split(" - ")
                                  : [stringCompleto, "0 personas"];

                              // Extraemos el número del texto "50 personas"
                              const numeroDeInvitados =
                                parseInt(textoHuespedes) || 0;
                              const esConceptoJardin =
                                String(extra.concepto).toLowerCase().trim() ===
                                "jardin";

                              return (
                                <tr
                                  key={extra.id}
                                  className="hover:bg-gray-50/50 transition-colors"
                                >
                                  {/* 1. Concepto Base */}
                                  <td className="p-2.5 font-bold text-gray-800">
                                    {extra.concepto}
                                  </td>

                                  {/* 2. Detalle Evento (Muestra "Boda2" si es jardín, o "-" si es cocina) */}
                                  <td className="p-2.5 text-left text-gray-600 font-semibold">
                                    {esConceptoJardin
                                      ? nombreDelEvento || "Evento"
                                      : "-"}
                                  </td>

                                  {/* 3. Cantidad de Invitados (Aforo Libre extraído del String) */}
                                  <td className="p-2.5 text-center font-black text-primary">
                                    {esConceptoJardin &&
                                    numeroDeInvitados > 0 ? (
                                      `${numeroDeInvitados}`
                                    ) : (
                                      <span className="text-gray-300 font-normal">
                                        -
                                      </span>
                                    )}
                                  </td>

                                  {/* 4. Cantidad de Servicios (Forzado contablemente a 1 para el Jardín) */}
                                  <td className="p-2.5 text-center text-gray-500">
                                    {esConceptoJardin ? "1" : extra.cantidad}
                                  </td>

                                  {/* 5. Días Totales de Renta */}
                                  <td className="p-2.5 text-center text-gray-500">
                                    {extra.dias}
                                  </td>

                                  {/* 6. Precio por Unidad */}
                                  <td className="p-2.5 text-right font-medium">
                                    {formatearMoneda(extra.precioUnitarioNoche)}
                                  </td>

                                  {/* 7. Porcentaje de Comisión */}
                                  <td className="p-2.5 text-center font-bold text-neutral">
                                    {extra.porcentajeComision > 0
                                      ? `${extra.porcentajeComision}%`
                                      : "-"}
                                  </td>

                                  {/* 8. Monto Retenido por Comisión */}
                                  <td className="p-2.5 text-right text-error font-medium">
                                    {extra.montoComision > 0
                                      ? `-${formatearMoneda(extra.montoComision)}`
                                      : "$0.00"}
                                  </td>

                                  {/* 9. Subtotal Final de Línea */}
                                  <td className="p-2.5 text-right font-bold text-primary text-[13px]">
                                    {formatearMoneda(extra.monto)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
