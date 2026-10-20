import React from "react";
import { useBitacoraBorrados } from "../hooks/useBitacoraBorrados";
import { ExtrasDesglose } from "../components/ExtrasDesglose";

export const BitacoraBorradosPage: React.FC = () => {
  const { logs, loading, error, recargar } = useBitacoraBorrados();

  return (
    <div className="min-h-screen bg-tertiary p-6 font-body text-neutral">
      {/* Encabezado Principal estilo Boutique */}
      <div className="flex justify-between items-center mb-8 border-b border-neutral/10 pb-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary tracking-wide">
            Bitácora de Auditoría
          </h1>
          <p className="text-sm text-surface mt-1">
            Registro histórico unificado de auditoría: eliminaciones y ediciones de reservaciones, abonos y egresos.
          </p>
        </div>
        <button
          onClick={recargar}
          className="bg-primary hover:bg-primary/90 text-secondary border border-secondary/40 font-semibold px-4 py-2 rounded shadow transition-colors text-sm cursor-pointer"
        >
          🔄 Actualizar Vista
        </button>
      </div>

      {/* Estados de Carga y Error */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <span className="ml-3 text-surface font-medium">
            Consultando registros de auditoría...
          </span>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error text-error p-4 rounded mb-6 text-sm">
          ⚠️ <strong>Error en Auditoría:</strong> {error}
        </div>
      )}

      {/* Tabla de Registros */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral/10 overflow-hidden">
          <table className="min-w-full divide-y divide-neutral/10">
            <thead className="bg-primary text-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-label uppercase tracking-wider font-semibold">
                  Fecha Movimiento
                </th>
                <th className="px-6 py-4 text-left text-xs font-label uppercase tracking-wider font-semibold">
                  Módulo Afectado
                </th>
                <th className="px-6 py-4 text-left text-xs font-label uppercase tracking-wider font-semibold">
                  ID Reg
                </th>
                <th className="px-6 py-4 text-left text-xs font-label uppercase tracking-wider font-semibold">
                  Autor
                </th>
                <th className="px-6 py-4 text-left text-xs font-label uppercase tracking-wider font-semibold">
                  Detalles del Movimiento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral/10 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-surface italic"
                  >
                    No se han detectado movimientos de auditoría (eliminaciones o ediciones) en el sistema.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const esEgreso = log.tablaAfectada.toLowerCase().includes("egreso");
                  const esPago = log.tablaAfectada.toLowerCase().includes("pago");

                  return (
                    <tr
                      key={String(log.id)}
                      className="hover:bg-surfacecontainer/40 transition-colors"
                    >
                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap text-surface font-medium text-xs">
                        {new Date(log.fechaBorrado).toLocaleString("es-MX")}
                      </td>

                      {/* Tabla Afectada y Acción */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          {/* Badge de la Tabla */}
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold w-fit border ${
                              esPago
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : esEgreso
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {log.tablaAfectada
                              .replace("AAC_Alcatraz_", "")
                              .toUpperCase()}
                          </span>

                          {/* Badge Dinámico: Eliminación o Edición */}
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider w-fit border ${
                              log.accion === "BORRADO"
                                ? "bg-error/15 text-error border-error/20"
                                : "bg-secondary/20 text-neutral border-secondary/40"
                            }`}
                          >
                            {log.accion === "BORRADO"
                              ? "🗑️ Eliminado"
                              : "📝 Editado"}
                          </span>
                        </div>
                      </td>

                      {/* ID Registro */}
                      <td className="px-6 py-4 whitespace-nowrap text-neutral font-mono font-bold">
                        #{log.registroId}
                      </td>

                      {/* Usuario Operador */}
                      <td className="px-6 py-4 whitespace-nowrap text-surface font-medium">
                        {log.usuarioId ? (
                          <span className="bg-surface text-tertiary px-2 py-0.5 rounded text-xs font-semibold">
                            👤 {log.usuarioId}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Desconocido
                          </span>
                        )}
                      </td>

                      {/* Detalles del Registro */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 max-w-lg">
                          {/* CASO EGRESOS */}
                          {esEgreso ? (
                            <>
                              {log.detalles.concepto && (
                                <div className="text-neutral font-semibold text-sm flex items-center gap-1.5">
                                  <span className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium">
                                    🏷️ Concepto: {log.detalles.concepto}
                                  </span>
                                </div>
                              )}

                              {log.detalles.fechaInicio && (
                                <div className="text-surface text-xs">
                                  📅 Fecha de Gasto: {log.detalles.fechaInicio?.split("T")[0]}
                                </div>
                              )}

                              {log.detalles.referenciaComprobante && (
                                <div className="text-xs text-surface">
                                  🔖 Referencia: <span className="font-medium text-neutral">{log.detalles.referenciaComprobante}</span>
                                </div>
                              )}

                              {log.detalles.descripcion && (
                                <div className="text-xs text-neutral/80 italic bg-neutral/5 p-1.5 rounded">
                                  "{log.detalles.descripcion}"
                                </div>
                              )}

                              {log.detalles.montoTotal !== undefined && (
                                <div className="text-xs font-medium">
                                  💰 Monto Actual:{" "}
                                  <span className="text-primary font-bold text-sm">
                                    $
                                    {log.detalles.montoTotal.toLocaleString("es-MX", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              )}

                              {/* Desglose de Campos Modificados */}
                              {log.detalles.cambios && log.detalles.cambios.length > 0 && (
                                <div className="mt-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 text-xs space-y-1.5">
                                  <p className="font-semibold text-[10px] text-amber-900 uppercase tracking-wider">
                                    Campos modificados:
                                  </p>
                                  {log.detalles.cambios.map((c, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-semibold">
                                        {c.campo}:
                                      </span>
                                      <span className="line-through text-red-600 bg-red-50 px-1 rounded">
                                        {typeof c.valorAnterior === "number"
                                          ? `$${c.valorAnterior.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                                          : String(c.valorAnterior ?? "(vacío)")}
                                      </span>
                                      <span className="text-surface font-bold">➔</span>
                                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1 rounded">
                                        {typeof c.valorNuevo === "number"
                                          ? `$${c.valorNuevo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                                          : String(c.valorNuevo ?? "(vacío)")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            /* CASO RESERVACIONES Y PAGOS */
                            <>
                              {log.detalles.clienteNombre && (
                                <div className="text-neutral font-semibold text-sm">
                                  👤 {log.detalles.clienteNombre}
                                </div>
                              )}

                              {(log.detalles.fechaInicio || log.detalles.fechaFin) && (
                                <div className="text-surface text-xs">
                                  📅 {log.detalles.fechaInicio?.split("T")[0]} al{" "}
                                  {log.detalles.fechaFin?.split("T")[0]}
                                </div>
                              )}

                              {log.detalles.montoTotal !== undefined && (
                                <div className="text-xs font-medium">
                                  💰 Monto Total:{" "}
                                  <span className="text-primary font-bold text-sm">
                                    $
                                    {log.detalles.montoTotal.toLocaleString("es-MX", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              )}

                              {/* Listado Desglosado de Extras */}
                              {log.detalles.extras && log.detalles.extras.length > 0 && (
                                <ExtrasDesglose extras={log.detalles.extras} />
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
