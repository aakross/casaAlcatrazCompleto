// ─────────────────────────────────────────────────────────────────────────────
// Component — DetalleExtrasView
// Vista analítica detallada de extras de reservación con filtros por Concepto,
// temporalidad (año/mes o rango libre), gráfica comparativa y tabla desglosada.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Sparkles,
  DollarSign,
  TrendingUp,
  BarChart2,
  PieChart,
  User,
  Percent,
} from "lucide-react";
import type {
  ExtraDetalleItem,
  FiltrosDetalleExtras,
} from "../../domain/estado-resultados.repository";
import { notify } from "../../../../core/components/notifierTostify";
import { formatearFechaDDMMYY } from "../utils/date-formatter";

interface Props {
  aniosDisponibles: number[];
  consultarDetalleExtras: (filtros: FiltrosDetalleExtras) => Promise<ExtraDetalleItem[]>;
  consultarConceptosExtras: () => Promise<string[]>;
}

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n ?? 0);

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

export function DetalleExtrasView({
  aniosDisponibles,
  consultarDetalleExtras,
  consultarConceptosExtras,
}: Props) {
  const anioActual = new Date().getFullYear();

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<string>("");
  const [conceptosDisponibles, setConceptosDisponibles] = useState<string[]>([]);
  const [modoFiltro, setModoFiltro] = useState<"anio" | "rango">("anio");
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(anioActual);
  const [mesSeleccionado, setMesSeleccionado] = useState<number | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // ── Datos ───────────────────────────────────────────────────────────────────
  const [extras, setExtras] = useState<ExtraDetalleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Cargar lista de conceptos existentes ──────────────────────────────────
  useEffect(() => {
    let cancel = false;
    const fetchConceptos = async () => {
      try {
        const lista = await consultarConceptosExtras();
        if (!cancel) setConceptosDisponibles(lista);
      } catch {
        // En caso de error, la lista quedará vacía
      }
    };
    void fetchConceptos();
    return () => {
      cancel = true;
    };
  }, [consultarConceptosExtras]);

  // ── Consulta de datos al backend ──────────────────────────────────────────
  const consultarExtras = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filtros: FiltrosDetalleExtras = {};

      if (conceptoSeleccionado.trim() !== "") {
        filtros.concepto = conceptoSeleccionado.trim();
      }

      if (modoFiltro === "anio") {
        filtros.anio = anioSeleccionado;
        if (mesSeleccionado !== "") {
          const mStr = String(mesSeleccionado).padStart(2, "0");
          filtros.fechaDesde = `${anioSeleccionado}-${mStr}-01`;
          const ultimoDia = new Date(anioSeleccionado, Number(mesSeleccionado), 0).getDate();
          filtros.fechaHasta = `${anioSeleccionado}-${mStr}-${String(ultimoDia).padStart(2, "0")}`;
        } else {
          filtros.fechaDesde = `${anioSeleccionado}-01-01`;
          filtros.fechaHasta = `${anioSeleccionado}-12-31`;
        }
      } else {
        if (fechaDesde) filtros.fechaDesde = fechaDesde;
        if (fechaHasta) filtros.fechaHasta = fechaHasta;
      }

      const data = await consultarDetalleExtras(filtros);
      setExtras(data);
    } catch (err: any) {
      const msg = err.message || "Error al consultar los extras de reservación.";
      setError(msg);
      notify.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    void consultarExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setConceptoSeleccionado("");
    setModoFiltro("anio");
    setAnioSeleccionado(anioActual);
    setMesSeleccionado("");
    setFechaDesde("");
    setFechaHasta("");
  };

  // ── Métricas y agregaciones para la gráfica ─────────────────────────────────
  const totalExtras = useMemo(() => {
    return extras.reduce((acc, curr) => acc + curr.monto, 0);
  }, [extras]);

  const totalComisiones = useMemo(() => {
    return extras.reduce((acc, curr) => acc + (curr.montoComision || 0), 0);
  }, [extras]);

  const promedioExtra = useMemo(() => {
    if (extras.length === 0) return 0;
    return totalExtras / extras.length;
  }, [extras, totalExtras]);

  // Datos para la gráfica sencilla de barras
  const datosGrafica = useMemo(() => {
    if (extras.length === 0) return [];

    // Si seleccionó concepto específico: Agrupar por Mes de la reserva
    if (conceptoSeleccionado !== "") {
      const map = new Map<string, number>();
      for (const item of extras) {
        const key = item.fechaInicioReserva.slice(0, 7); // YYYY-MM
        map.set(key, (map.get(key) || 0) + item.monto);
      }
      return Array.from(map.entries())
        .map(([etiqueta, monto]) => ({
          etiqueta,
          monto,
          porcentaje: totalExtras > 0 ? (monto / totalExtras) * 100 : 0,
        }))
        .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta));
    }

    // Si no seleccionó concepto: Agrupar por Concepto de Extra
    const map = new Map<string, number>();
    for (const item of extras) {
      const key = item.concepto || "Sin Concepto";
      map.set(key, (map.get(key) || 0) + item.monto);
    }
    return Array.from(map.entries())
      .map(([etiqueta, monto]) => ({
        etiqueta,
        monto,
        porcentaje: totalExtras > 0 ? (monto / totalExtras) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto);
  }, [extras, conceptoSeleccionado, totalExtras]);

  const maxMontoGrafica = useMemo(() => {
    if (datosGrafica.length === 0) return 1;
    return Math.max(...datosGrafica.map((d) => d.monto), 1);
  }, [datosGrafica]);

  return (
    <div className="space-y-6">
      {/* ── Panel de Filtros ────────────────────────────────────────────────── */}
      <div className="bg-surfacecontainer rounded-2xl p-6 shadow-sm border border-neutral/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary" />
            <h3 className="font-headline text-primary text-lg font-bold">
              Filtro Detallado de Extras
            </h3>
          </div>

          {/* Toggle de Temporalidad */}
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
              Por Año / Mes
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

        {/* Grid de Selectores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-body text-sm">
          {/* 1. Selector de Concepto de Extra */}
          <div>
            <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              Concepto de Extra
            </label>
            <select
              value={conceptoSeleccionado}
              onChange={(e) => setConceptoSeleccionado(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer text-xs font-medium"
            >
              <option value="">Todos los Extras</option>
              {conceptosDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2 y 3. Temporalidad */}
          {modoFiltro === "anio" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  Año
                </label>
                <select
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer text-xs font-medium"
                >
                  {aniosDisponibles.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                  Mes (Opcional)
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) =>
                    setMesSeleccionado(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer text-xs font-medium"
                >
                  <option value="">Todo el Año</option>
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
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 text-xs"
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
                  className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 text-xs"
                />
              </div>
            </>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 border border-neutral/20 rounded-xl text-neutral font-semibold text-xs hover:bg-neutral/5 transition disabled:opacity-50 font-body cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Limpiar Filtros
          </button>
          <button
            type="button"
            onClick={consultarExtras}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl font-semibold text-xs hover:opacity-90 transition disabled:opacity-50 font-body shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-secondary" />
            {isLoading ? "Consultando..." : "Consultar Extras"}
          </button>
        </div>
      </div>

      {/* ── Banner de Error si falla la consulta ────────────────────────────── */}
      {error && !isLoading && (
        <div className="bg-error/10 border border-error/30 rounded-2xl p-4 text-center text-error font-body text-xs">
          {error}
        </div>
      )}

      {/* ── KPIs Rápidos ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Total Ingresos Extras
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {mxn(totalExtras)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Servicios Contratados
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {extras.length}{" "}
              <span className="text-xs font-body font-normal text-neutral/50">
                registros
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Promedio por Servicio
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {mxn(promedioExtra)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ohsunny/15 flex items-center justify-center text-ohsunny">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Total Comisiones
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {mxn(totalComisiones)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary/15 flex items-center justify-center text-tertiary">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Gráfica Sencilla de Barras ───────────────────────────────────────── */}
      {datosGrafica.length > 0 && (
        <div className="bg-surfacecontainer rounded-2xl p-6 border border-neutral/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-secondary" />
              <h4 className="font-headline text-primary text-base font-bold">
                {conceptoSeleccionado !== ""
                  ? `Distribución en el Tiempo — Extra: ${conceptoSeleccionado}`
                  : "Distribución General por Concepto de Extra"}
              </h4>
            </div>
            <span className="text-xs font-body text-neutral/50">
              Proporción sobre el total filtrado
            </span>
          </div>

          {/* Barras de Progreso Visuales */}
          <div className="space-y-3 pt-2">
            {datosGrafica.map((item, idx) => {
              const anchoPorcentaje = Math.min(
                100,
                Math.max(4, (item.monto / maxMontoGrafica) * 100)
              );

              return (
                <div key={item.etiqueta} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-body">
                    <span className="font-semibold text-neutral/90 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                      {item.etiqueta}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {mxn(item.monto)}
                      </span>
                      <span className="text-[11px] text-neutral/50 font-mono">
                        ({item.porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral/10 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx % 3 === 0
                          ? "bg-primary"
                          : idx % 3 === 1
                          ? "bg-secondary"
                          : "bg-ohsunny"
                      }`}
                      style={{ width: `${anchoPorcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tabla de Movimientos Detallados ─────────────────────────────────── */}
      <div className="bg-surfacecontainer rounded-2xl shadow-sm border border-neutral/10 overflow-hidden">
        <div className="bg-primary px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-secondary" />
            <h3 className="font-headline text-lg font-bold">
              Listado Detallado de Servicios Extras
            </h3>
          </div>
          <span className="text-xs font-body text-secondary bg-white/10 px-2.5 py-1 rounded-md font-semibold">
            {extras.length} extras contratados
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
            <p className="font-body text-neutral text-sm">
              Cargando extras de reservación...
            </p>
          </div>
        ) : extras.length === 0 ? (
          <div className="p-12 text-center font-body text-neutral/60 text-sm">
            No se encontraron extras con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-primary/5 border-b border-neutral/15 text-xs text-primary/80 font-bold uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Fechas Reserva</th>
                  <th className="text-left px-4 py-3">Huésped / Reserva</th>
                  <th className="text-left px-4 py-3">Concepto Extra</th>
                  <th className="text-left px-4 py-3">Detalle Unidades</th>
                  <th className="text-left px-4 py-3">Evento / Comisión</th>
                  <th className="text-right px-5 py-3">Total Extra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral/10">
                {extras.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-neutral/5 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-neutral/70 whitespace-nowrap">
                      {formatearFechaDDMMYY(e.fechaInicioReserva)} al {formatearFechaDDMMYY(e.fechaFinReserva)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral">
                        <User className="w-3.5 h-3.5 text-neutral/50" />
                        <span>{e.clienteNombre || `Reserva #${e.reservacionId}`}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-neutral/50">
                          ID: #{e.reservacionId}
                        </span>
                        {e.origenReserva && (
                          <span className="inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded bg-neutral/10 text-neutral/70">
                            {e.origenReserva}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-secondary/15 text-secondary">
                        <Sparkles className="w-3 h-3" />
                        {e.concepto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral/80 text-xs">
                      {e.cantidad > 0 || e.dias > 0 ? (
                        <span>
                          <strong className="text-neutral font-semibold">
                            {e.cantidad}
                          </strong>{" "}
                          serv. ×{" "}
                          <strong className="text-neutral font-semibold">
                            {e.dias}
                          </strong>{" "}
                          noches @ {mxn(e.precioUnitarioNoche)}
                        </span>
                      ) : (
                        <span className="text-neutral/50 italic">Fijo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {e.tipoEvento ? (
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary mr-1.5">
                          {e.tipoEvento}
                        </span>
                      ) : null}
                      {e.montoComision > 0 ? (
                        <span className="text-neutral/70 font-mono text-[11px]">
                          Comisión: {e.porcentajeComision}% ({mxn(e.montoComision)})
                        </span>
                      ) : (
                        <span className="text-neutral/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-primary whitespace-nowrap">
                      {mxn(e.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
