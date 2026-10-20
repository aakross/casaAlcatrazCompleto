// ─────────────────────────────────────────────────────────────────────────────
// Component — EstadoResultadosTabla
// Filtros superiores + tabla ejecutiva financiera con dos columnas en paralelo:
// 1. Mensual (Periodo solicitado)
// 2. Acumulado (1 de Enero a fin de periodo)
// Incluye descarte de cuentas en cero y desglose de movimientos con descripción.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { Search, RefreshCw, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { notify } from "../../../../core/components/notifierTostify";
import { formatearFechaDDMMYY } from "../utils/date-formatter";
import type { useEstadoResultados } from "../hooks/useEstadoResultados";
import type { FiltrosEstadoResultados } from "../../domain/estado-resultados.repository";

type HookReturn = ReturnType<typeof useEstadoResultados>;

interface Props {
  estadoResultados: HookReturn["estadoResultados"];
  aniosDisponibles: HookReturn["aniosDisponibles"];
  filtros: HookReturn["filtros"];
  isLoading: HookReturn["isLoading"];
  error: HookReturn["error"];
  actualizarFiltros: HookReturn["actualizarFiltros"];
  cargarEstadoResultados: HookReturn["cargarEstadoResultados"];
  resetFiltros: HookReturn["resetFiltros"];
}

// ── Formateadores ─────────────────────────────────────────────────────────────
const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n ?? 0);

const pct = (n: number) => `${(n ?? 0).toFixed(1)}%`;

// ── Constantes ──────────────────────────────────────────────────────────────
const MESES = [
  { valor: 1, nombre: "Enero" },
  { valor: 2, nombre: "Febrero" },
  { valor: 3, nombre: "Marzo" },
  { valor: 4, nombre: "Abril" },
  { valor: 5, nombre: "Mayo" },
  { valor: 6, nombre: "Junio" },
  { valor: 7, nombre: "Julio" },
  { valor: 8, nombre: "Agosto" },
  { valor: 9, nombre: "Septiembre" },
  { valor: 10, nombre: "Octubre" },
  { valor: 11, nombre: "Noviembre" },
  { valor: 12, nombre: "Diciembre" },
];

export function EstadoResultadosTabla({
  estadoResultados,
  aniosDisponibles,
  filtros,
  isLoading,
  error,
  actualizarFiltros,
  cargarEstadoResultados,
  resetFiltros,
}: Props) {
  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;

  const [modoFiltro, setModoFiltro] = useState<"anio" | "rango">("anio");
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(
    filtros.anio ?? anioActual
  );
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(mesActual);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [provisionIsrManual, setProvisionIsrManual] = useState(0);

  const onBuscar = () => {
    if (modoFiltro === "rango" && (!fechaDesde || !fechaHasta)) {
      notify.error("Selecciona un rango de fechas completo.");
      return;
    }

    let fDesde = fechaDesde;
    let fHasta = fechaHasta;
    let anioEj = anioSeleccionado;

    if (modoFiltro === "anio") {
      const mesStr = String(mesSeleccionado).padStart(2, "0");
      fDesde = `${anioSeleccionado}-${mesStr}-01`;
      const ultimoDiaNum = new Date(anioSeleccionado, mesSeleccionado, 0).getDate();
      fHasta = `${anioSeleccionado}-${mesStr}-${String(ultimoDiaNum).padStart(2, "0")}`;
      anioEj = anioSeleccionado;
    } else {
      anioEj = new Date(fechaHasta).getFullYear();
    }

    const filtrosAplicar: FiltrosEstadoResultados = {
      anio: anioEj,
      fechaDesde: fDesde,
      fechaHasta: fHasta,
      provisionIsrManual: provisionIsrManual > 0 ? provisionIsrManual : undefined,
    };

    actualizarFiltros(filtrosAplicar);
    void cargarEstadoResultados(filtrosAplicar);
  };

  const onReset = () => {
    setModoFiltro("anio");
    setAnioSeleccionado(anioActual);
    setMesSeleccionado(mesActual);
    setFechaDesde("");
    setFechaHasta("");
    setProvisionIsrManual(0);
    resetFiltros();
  };

  const r = estadoResultados?.resumen;
  const ingresosDetalle = estadoResultados?.ingresosDetalle;
  const categorias = estadoResultados?.categorias || [];

  return (
    <div className="space-y-6">
      {/* ── Panel de Filtros ──────────────────────────────────────────────── */}
      <div className="bg-surfacecontainer rounded-2xl p-6 shadow-sm border border-neutral/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-secondary" />
            <h3 className="font-headline text-primary text-lg font-bold">
              Filtros del Reporte
            </h3>
          </div>

          {/* Selector de modo */}
          <div className="flex rounded-lg border border-neutral/20 overflow-hidden text-xs font-semibold font-body">
            <button
              type="button"
              onClick={() => setModoFiltro("anio")}
              className={`px-3 py-1.5 transition cursor-pointer ${
                modoFiltro === "anio"
                  ? "bg-primary text-white"
                  : "bg-surfacecontainer text-neutral hover:bg-neutral/10"
              }`}
            >
              Por Año y Mes
            </button>
            <button
              type="button"
              onClick={() => setModoFiltro("rango")}
              className={`px-3 py-1.5 transition cursor-pointer ${
                modoFiltro === "rango"
                  ? "bg-primary text-white"
                  : "bg-surfacecontainer text-neutral hover:bg-neutral/10"
              }`}
            >
              Rango Libre
            </button>
          </div>
        </div>

        {/* Inputs dinámicos según el modo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body text-sm">
          {modoFiltro === "anio" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider">
                  Año del Ejercicio
                </label>
                <select
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer"
                >
                  {aniosDisponibles.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider">
                  Mes del Periodo
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer"
                >
                  {MESES.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider">
              Provisión ISR Manual (MXN)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={provisionIsrManual || ""}
              placeholder="Opcional: 0.00"
              onChange={(e) => setProvisionIsrManual(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 border border-neutral/20 rounded-xl text-neutral font-semibold text-xs hover:bg-neutral/5 transition disabled:opacity-50 font-body cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={onBuscar}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl font-semibold text-xs hover:opacity-90 transition disabled:opacity-50 font-body shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-secondary" />
            {isLoading ? "Calculando..." : "Consultar Reporte"}
          </button>
        </div>
      </div>

      {/* ── Estado de Carga / Error ────────────────────────────────────────── */}
      {isLoading && (
        <div className="bg-surfacecontainer rounded-2xl p-12 text-center border border-neutral/10">
          <RefreshCw className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
          <p className="font-body text-neutral text-sm">
            Generando Estado de Resultados...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-error/10 border border-error/30 rounded-2xl p-6 text-center text-error font-body text-sm">
          {error}
        </div>
      )}

      {/* ── Tabla Ejecutiva Financiera (Mensual vs Acumulado) ─────────────── */}
      {!isLoading && !error && r && (
        <div className="bg-surfacecontainer rounded-2xl shadow-sm border border-neutral/10 overflow-hidden">
          {/* Encabezado del Estado de Resultados (Idéntico a celdas A3:B4 del Excel) */}
          <div className="bg-primary px-6 py-5 text-white flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-secondary font-headline text-sm font-bold tracking-widest uppercase block mb-1">
                Casa Alcatraz
              </span>
              <h2 className="font-headline text-2xl font-bold tracking-wide">
                Estado de Resultados
              </h2>
              <p className="font-body text-white/80 text-xs mt-1">
                Del{" "}
                <span className="text-secondary font-semibold font-mono">
                  {formatearFechaDDMMYY(r.fechaDesde)}
                </span>{" "}
                al{" "}
                <span className="text-secondary font-semibold font-mono">
                  {formatearFechaDDMMYY(r.fechaHasta)}
                </span>{" "}
                (Acumulado anual desde{" "}
                <span className="text-white/90 font-mono">
                  {formatearFechaDDMMYY(r.fechaInicioAnio || `${anioSeleccionado}-01-01`)}
                </span>
                )
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs uppercase px-2.5 py-1 bg-secondary text-primary font-bold rounded-md tracking-wider">
                Cifras en MXN
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              {/* ── 1. Cabeceras con los dos bloques idénticos al Excel ── */}
              <thead>
                <tr className="border-b border-neutral/10 bg-primary/5">
                  <th
                    rowSpan={2}
                    className="text-left px-6 py-3 font-headline text-primary font-bold text-xs uppercase tracking-wider min-w-[280px]"
                  >
                    Concepto / Cuenta
                  </th>
                  <th
                    colSpan={2}
                    className="text-center px-4 py-2 font-headline text-primary font-bold text-xs uppercase tracking-wider border-l border-neutral/10 bg-primary/10"
                  >
                    Mensual {MESES.find((m) => m.valor === mesSeleccionado)?.nombre || ""} {String(anioSeleccionado).slice(-2)}
                  </th>
                  <th
                    colSpan={2}
                    className="text-center px-4 py-2 font-headline text-primary font-bold text-xs uppercase tracking-wider border-l border-neutral/10 bg-secondary/10"
                  >
                    Acumulado {anioSeleccionado}
                  </th>
                </tr>
                <tr className="border-b border-neutral/15 bg-primary/5 text-[11px] text-primary/80 font-bold uppercase tracking-wider">
                  <th className="text-right px-4 py-2 border-l border-neutral/10 whitespace-nowrap">
                    Importe Mensual
                  </th>
                  <th className="text-right px-4 py-2 whitespace-nowrap">
                    %
                  </th>
                  <th className="text-right px-4 py-2 border-l border-neutral/10 whitespace-nowrap">
                    Importe Acumulado
                  </th>
                  <th className="text-right px-4 py-2 whitespace-nowrap">
                    %
                  </th>
                </tr>
              </thead>
              {/* ── SECCIÓN: INGRESOS ────────────────────────────────────────────── */}
              <tbody>
                {/* Encabezado de la Sección de Ingresos (idéntico al Excel: Fila 8 INGRESOS) */}
                <tr className="bg-surface/15 border-t-2 border-neutral/10">
                  <td
                    colSpan={5}
                    className="px-6 py-2.5 font-headline text-primary font-bold text-xs uppercase tracking-widest"
                  >
                    Ingresos
                  </td>
                </tr>

                {/* Fila: Hospedajes / Reservaciones */}
                {((ingresosDetalle?.totalHospedajeMensual || 0) > 0 ||
                  (ingresosDetalle?.totalHospedajeAcumulado || 0) > 0 ||
                  (r.totalIngresos === 0 && (!ingresosDetalle?.extras || ingresosDetalle.extras.length === 0))) && (
                  <tr className="border-b border-neutral/5 hover:bg-neutral/5 transition-colors">
                    <td className="px-6 py-2.5 pl-10 text-neutral">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral/90">
                          Ingresos por Hospedajes / Reservas
                        </span>
                        {ingresosDetalle && ingresosDetalle.cantidadReservasMensual > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold tracking-normal">
                            {ingresosDetalle.cantidadReservasMensual}{" "}
                            {ingresosDetalle.cantidadReservasMensual === 1 ? "reserva" : "reservas"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral border-l border-neutral/10 font-medium">
                      {mxn(ingresosDetalle?.totalHospedajeMensual ?? r.totalIngresos)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral/60 text-xs">
                      {pct(ingresosDetalle?.porcentajeHospedajeSobreIngresos ?? 100)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral border-l border-neutral/10 font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{mxn(ingresosDetalle?.totalHospedajeAcumulado ?? r.totalIngresosAcumulado)}</span>
                        {ingresosDetalle && ingresosDetalle.cantidadReservasAcumulado > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral/10 text-neutral/70 font-normal">
                            {ingresosDetalle.cantidadReservasAcumulado}{" "}
                            {ingresosDetalle.cantidadReservasAcumulado === 1 ? "res." : "res."}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral/60 text-xs">
                      {pct(ingresosDetalle?.porcentajeHospedajeSobreIngresosAcumulado ?? 100)}
                    </td>
                  </tr>
                )}

                {/* Filas de Servicios Extras Activos (excluyendo ceros) */}
                {ingresosDetalle?.extras.map((extra) => (
                  <tr
                    key={`extra-${extra.concepto}`}
                    className="border-b border-neutral/5 hover:bg-neutral/5 transition-colors"
                  >
                    <td className="px-6 py-2.5 pl-10 text-neutral">
                      <span className="font-medium text-neutral/90">
                        Ingresos por {extra.concepto}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral border-l border-neutral/10 font-medium">
                      {mxn(extra.totalMensual)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral/60 text-xs">
                      {pct(extra.porcentajeSobreIngresos)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral border-l border-neutral/10 font-medium">
                      {mxn(extra.totalAcumulado)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral/60 text-xs">
                      {pct(extra.porcentajeSobreIngresosAcumulado)}
                    </td>
                  </tr>
                ))}

                {/* ── Total de Ingresos (Celdas B16:G16 del Excel) ────────────────── */}
                <tr className="bg-primary/5 border-b border-neutral/15">
                  <td className="px-6 py-3 font-headline text-primary font-bold text-base">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      Total de Ingresos
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary text-base border-l border-neutral/10">
                    {mxn(r.totalIngresos)}
                  </td>
                  <td className="px-4 py-3 text-right text-secondary font-bold text-xs">
                    100.0%
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary text-base border-l border-neutral/10">
                    {mxn(r.totalIngresosAcumulado)}
                  </td>
                  <td className="px-4 py-3 text-right text-secondary font-bold text-xs">
                    100.0%
                  </td>
                </tr>
              </tbody>

              {/* ── Categorías y Conceptos (Filtrado estricto de saldos en cero) ──────── */}
              {categorias
                .map((cat) => {
                  const conceptosActivos = (cat.conceptos || []).filter(
                    (c) => c.totalConcepto > 0 || c.totalConceptoAcumulado > 0
                  );
                  return { ...cat, conceptosActivos };
                })
                .filter(
                  (cat) =>
                    cat.conceptosActivos.length > 0 ||
                    cat.subtotal > 0 ||
                    cat.subtotalAcumulado > 0
                )
                .map((cat) => {
                  return (
                    <tbody key={`cat-group-${cat.categoriaId}`}>
                      {/* Encabezado de la Categoría */}
                      <tr className="bg-surface/15 border-t-2 border-neutral/10">
                        <td
                          colSpan={5}
                          className="px-6 py-2.5 font-headline text-primary font-bold text-xs uppercase tracking-widest"
                        >
                          {cat.categoriaNombre}
                        </td>
                      </tr>

                      {/* Filas de conceptos con saldo activo (Idéntico a las filas del Excel, sin detalles) */}
                      {cat.conceptosActivos.map((c) => (
                        <tr
                          key={`concepto-${c.conceptoId}`}
                          className="border-b border-neutral/5 hover:bg-neutral/5 transition-colors"
                        >
                          <td className="px-6 py-2.5 pl-10 text-neutral">
                            <span className="font-medium text-neutral/90">
                              {c.conceptoNombre}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral border-l border-neutral/10 font-medium">
                            {mxn(c.totalConcepto)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral/60 text-xs">
                            {pct(c.porcentajeSobreIngresos)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral border-l border-neutral/10 font-medium">
                            {mxn(c.totalConceptoAcumulado)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-neutral/60 text-xs">
                            {pct(c.porcentajeSobreIngresosAcumulado)}
                          </td>
                        </tr>
                      ))}

                      {/* Subtotal de la Categoría */}
                      <tr className="bg-secondary/5 border-b border-secondary/20 font-semibold text-xs">
                        <td className="px-6 py-2 pl-10 uppercase tracking-wide text-neutral">
                          Subtotal — {cat.categoriaNombre}
                        </td>
                        <td className="px-4 py-2 text-right text-neutral border-l border-neutral/10">
                          {mxn(cat.subtotal)}
                        </td>
                        <td className="px-4 py-2 text-right text-secondary font-bold">
                          {pct(cat.porcentajeSobreIngresos)}
                        </td>
                        <td className="px-4 py-2 text-right text-neutral border-l border-neutral/10">
                          {mxn(cat.subtotalAcumulado)}
                        </td>
                        <td className="px-4 py-2 text-right text-secondary font-bold">
                          {pct(cat.porcentajeSobreIngresosAcumulado)}
                        </td>
                      </tr>
                    </tbody>
                  );
                })}

              {/* ── Totales y Utilidades ─────────────────────────────────── */}
              <tbody>
                {/* ── Separador ────────────────────────────────────────── */}
                <tr>
                  <td colSpan={5} className="h-2 bg-neutral/5" />
                </tr>

                {/* ── Total Gastos de Operación ─────────────────────────── */}
                <tr className="bg-ohsunny/10 border-t-2 border-ohsunny/40">
                  <td className="px-6 py-3 font-headline text-neutral font-bold">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-ohsunny" />
                      Total Gastos de Operación
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-neutral border-l border-neutral/10">
                    {mxn(r.totalGastosOperacion)}
                  </td>
                  <td className="px-4 py-3 text-right text-ohsunny font-bold text-xs">
                    {pct(r.porcentajeGastosSobreIngresos)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-neutral border-l border-neutral/10">
                    {mxn(r.totalGastosOperacionAcumulado)}
                  </td>
                  <td className="px-4 py-3 text-right text-ohsunny font-bold text-xs">
                    {pct(r.porcentajeGastosSobreIngresosAcumulado)}
                  </td>
                </tr>

                {/* ── Utilidad de Operación ─────────────────────────────── */}
                <tr
                  className={`border-b border-neutral/10 ${
                    r.utilidadOperacion >= 0 ? "bg-primary/5" : "bg-error/5"
                  }`}
                >
                  <td className="px-6 py-3 font-headline text-primary font-bold">
                    Utilidad de Operación
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold text-lg border-l border-neutral/10 ${
                      r.utilidadOperacion >= 0 ? "text-primary" : "text-error"
                    }`}
                  >
                    {mxn(r.utilidadOperacion)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral/40 text-xs">—</td>
                  <td
                    className={`px-4 py-3 text-right font-bold text-lg border-l border-neutral/10 ${
                      r.utilidadOperacionAcumulado >= 0 ? "text-primary" : "text-error"
                    }`}
                  >
                    {mxn(r.utilidadOperacionAcumulado)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral/40 text-xs">—</td>
                </tr>

                {/* ── Provisión de Impuestos (Celda B47 del Excel: Provisión de ISR) ────── */}
                <tr className="border-b border-neutral/10 bg-neutral/5">
                  <td className="px-6 py-3 text-neutral/80 pl-10 italic flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-neutral/50" />
                    Provisión de ISR
                  </td>
                  <td className="px-4 py-3 text-right text-neutral border-l border-neutral/10">
                    {r.provisionIsr > 0 ? `(${mxn(r.provisionIsr)})` : mxn(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral/50 text-xs">
                    {r.totalIngresos > 0 && r.provisionIsr > 0
                      ? pct((r.provisionIsr / r.totalIngresos) * 100)
                      : "0.0%"}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral border-l border-neutral/10">
                    {r.provisionIsrAcumulado > 0 ? `(${mxn(r.provisionIsrAcumulado)})` : mxn(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral/50 text-xs">
                    {r.totalIngresosAcumulado > 0 && r.provisionIsrAcumulado > 0
                      ? pct((r.provisionIsrAcumulado / r.totalIngresosAcumulado) * 100)
                      : "0.0%"}
                  </td>
                </tr>

                {/* ── Utilidad Neta ─────────────────────────────────────── */}
                <tr
                  className={`border-t-2 ${
                    r.utilidadNeta >= 0
                      ? "border-secondary bg-secondary/15"
                      : "border-error bg-error/15"
                  }`}
                >
                  <td className="px-6 py-4 font-headline text-primary font-bold text-lg">
                    Utilidad Neta
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-bold text-xl border-l border-neutral/10 ${
                      r.utilidadNeta >= 0 ? "text-primary" : "text-error"
                    }`}
                  >
                    {mxn(r.utilidadNeta)}
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-bold text-sm ${
                      r.utilidadNeta >= 0 ? "text-secondary" : "text-error"
                    }`}
                  >
                    {pct(r.porcentajeUtilidadNetaSobreIngresos)}
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-bold text-xl border-l border-neutral/10 ${
                      r.utilidadNetaAcumulado >= 0 ? "text-primary" : "text-error"
                    }`}
                  >
                    {mxn(r.utilidadNetaAcumulado)}
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-bold text-sm ${
                      r.utilidadNetaAcumulado >= 0 ? "text-secondary" : "text-error"
                    }`}
                  >
                    {pct(r.porcentajeUtilidadNetaSobreIngresosAcumulado)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
