// ─────────────────────────────────────────────────────────────────────────────
// Component — DetalleEgresosView
// Vista analítica detallada de egresos con filtros por Tipo de Gasto (Categoría),
// Concepto dependiente, rango de fechas / año, y gráfica sencilla interactiva.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  TrendingDown,
  BarChart2,
  PieChart,
  Edit3,
} from "lucide-react";
import type {
  CatalogosData,
  EgresoDetalleItem,
  FiltrosDetalleEgresos,
  ActualizarEgresoPayload,
} from "../../domain/estado-resultados.repository";
import { notify } from "../../../../core/components/notifierTostify";
import { formatearFechaDDMMYY } from "../utils/date-formatter";
import { ModalEditarEgreso } from "./ModalEditarEgreso";

interface Props {
  catalogos: CatalogosData;
  aniosDisponibles: number[];
  consultarDetalleEgresos: (filtros: FiltrosDetalleEgresos) => Promise<EgresoDetalleItem[]>;
  actualizarEgreso?: (
    payload: Omit<ActualizarEgresoPayload, "usuarioId" | "usuarioNombre">
  ) => Promise<void>;
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

export function DetalleEgresosView({
  catalogos,
  aniosDisponibles,
  consultarDetalleEgresos,
  actualizarEgreso,
}: Props) {
  const anioActual = new Date().getFullYear();

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [conceptoId, setConceptoId] = useState<number | "">("");
  const [modoFiltro, setModoFiltro] = useState<"anio" | "rango">("anio");
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(anioActual);
  const [mesSeleccionado, setMesSeleccionado] = useState<number | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // ── Datos ───────────────────────────────────────────────────────────────────
  const [egresos, setEgresos] = useState<EgresoDetalleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Estado Modal Edición (con Bitácora) ──────────────────────────────────────
  const [egresoAEditar, setEgresoAEditar] = useState<EgresoDetalleItem | null>(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  // ── Conceptos dependientes del Tipo de Gasto (Categoría) ───────────────────
  const conceptosFiltrados = useMemo(() => {
    if (!categoriaId) return [];
    return catalogos.conceptos.filter((c) => c.categoriaId === Number(categoriaId));
  }, [categoriaId, catalogos.conceptos]);

  // Al cambiar la categoría, resetear el concepto
  const handleCategoriaChange = (nuevaCat: number | "") => {
    setCategoriaId(nuevaCat);
    setConceptoId("");
  };

  // ── Consulta de datos al backend ──────────────────────────────────────────
  const consultarEgresos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filtros: FiltrosDetalleEgresos = {};

      if (categoriaId !== "") filtros.categoriaId = Number(categoriaId);
      if (conceptoId !== "") filtros.conceptoId = Number(conceptoId);

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

      const data = await consultarDetalleEgresos(filtros);
      setEgresos(data);
    } catch (err: any) {
      const msg = err.message || "Error al consultar los egresos.";
      setError(msg);
      notify.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    void consultarEgresos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setCategoriaId("");
    setConceptoId("");
    setModoFiltro("anio");
    setAnioSeleccionado(anioActual);
    setMesSeleccionado("");
    setFechaDesde("");
    setFechaHasta("");
  };

  // ── Métricas y agregaciones para la gráfica ─────────────────────────────────
  const totalGastado = useMemo(() => {
    return egresos.reduce((acc, curr) => acc + curr.monto, 0);
  }, [egresos]);

  const promedioGasto = useMemo(() => {
    if (egresos.length === 0) return 0;
    return totalGastado / egresos.length;
  }, [egresos, totalGastado]);

  // Datos para la gráfica sencilla de barras
  const datosGrafica = useMemo(() => {
    if (egresos.length === 0) return [];

    // Si seleccionó concepto específico: Agrupar por mes o fecha
    if (conceptoId !== "") {
      const map = new Map<string, number>();
      for (const e of egresos) {
        const key = e.fechaGasto.slice(0, 7); // YYYY-MM
        map.set(key, (map.get(key) || 0) + e.monto);
      }
      return Array.from(map.entries())
        .map(([etiqueta, monto]) => ({
          etiqueta,
          monto,
          porcentaje: totalGastado > 0 ? (monto / totalGastado) * 100 : 0,
        }))
        .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta));
    }

    // Si seleccionó Tipo de Gasto (Categoría): Agrupar por Concepto
    if (categoriaId !== "") {
      const map = new Map<string, number>();
      for (const e of egresos) {
        map.set(e.conceptoNombre, (map.get(e.conceptoNombre) || 0) + e.monto);
      }
      return Array.from(map.entries())
        .map(([etiqueta, monto]) => ({
          etiqueta,
          monto,
          porcentaje: totalGastado > 0 ? (monto / totalGastado) * 100 : 0,
        }))
        .sort((a, b) => b.monto - a.monto);
    }

    // Si no seleccionó categoría: Agrupar por Categoría (Tipo de Gasto)
    const map = new Map<string, number>();
    for (const e of egresos) {
      map.set(e.categoriaNombre, (map.get(e.categoriaNombre) || 0) + e.monto);
    }
    return Array.from(map.entries())
      .map(([etiqueta, monto]) => ({
        etiqueta,
        monto,
        porcentaje: totalGastado > 0 ? (monto / totalGastado) * 100 : 0,
      }))
      .sort((a, b) => b.monto - a.monto);
  }, [egresos, categoriaId, conceptoId, totalGastado]);

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
              Filtro Detallado de Egresos
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-body text-sm">
          {/* 1. Selector de Tipo de Gasto (Categoría) */}
          <div>
            <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              1. Tipo de Gasto
            </label>
            <select
              value={categoriaId}
              onChange={(e) =>
                handleCategoriaChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer text-xs font-medium"
            >
              <option value="">Todos los Tipos de Gasto</option>
              {catalogos.categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Selector de Concepto (Dependiente de Tipo de Gasto) */}
          <div>
            <label className="block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-secondary" />
              2. Concepto
            </label>
            <select
              value={conceptoId}
              disabled={!categoriaId}
              onChange={(e) =>
                setConceptoId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {categoriaId
                  ? "Todos los Conceptos de este Tipo"
                  : "Selecciona primero un Tipo de Gasto"}
              </option>
              {conceptosFiltrados.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 3 y 4. Temporalidad */}
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
            onClick={consultarEgresos}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl font-semibold text-xs hover:opacity-90 transition disabled:opacity-50 font-body shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-secondary" />
            {isLoading ? "Consultando..." : "Consultar Egresos"}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Total Egresos Filtrados
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {mxn(totalGastado)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-ohsunny/15 flex items-center justify-center text-ohsunny">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Cantidad de Movimientos
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {egresos.length}{" "}
              <span className="text-xs font-body font-normal text-neutral/50">
                registros
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surfacecontainer rounded-2xl p-5 border border-neutral/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral/60 font-body uppercase tracking-wider">
              Promedio por Movimiento
            </p>
            <p className="font-headline text-2xl font-bold text-primary mt-1">
              {mxn(promedioGasto)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
            <DollarSign className="w-6 h-6" />
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
                {conceptoId !== ""
                  ? `Distribución en el Tiempo — ${egresos[0]?.conceptoNombre || "Concepto"}`
                  : categoriaId !== ""
                  ? `Distribución por Concepto — ${egresos[0]?.categoriaNombre || "Tipo de Gasto"}`
                  : "Distribución General por Tipo de Gasto"}
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
              Listado de Movimientos Individuales
            </h3>
          </div>
          <span className="text-xs font-body text-secondary bg-white/10 px-2.5 py-1 rounded-md font-semibold">
            {egresos.length} resultados encontrados
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-secondary animate-spin mx-auto mb-3" />
            <p className="font-body text-neutral text-sm">
              Cargando movimientos de egresos...
            </p>
          </div>
        ) : egresos.length === 0 ? (
          <div className="p-12 text-center font-body text-neutral/60 text-sm">
            No se encontraron gastos con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-primary/5 border-b border-neutral/15 text-xs text-primary/80 font-bold uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Tipo de Gasto</th>
                  <th className="text-left px-4 py-3">Concepto</th>
                  <th className="text-left px-4 py-3 min-w-[240px]">
                    Descripción del Gasto
                  </th>
                  <th className="text-left px-4 py-3">Referencia / Comprobante</th>
                  <th className="text-right px-5 py-3">Monto</th>
                  <th className="text-center px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral/10">
                {egresos.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-neutral/5 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-neutral/70 whitespace-nowrap">
                      {formatearFechaDDMMYY(e.fechaGasto)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {e.categoriaNombre}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral whitespace-nowrap">
                      {e.conceptoNombre}
                    </td>
                    <td className="px-4 py-3 text-neutral/90 italic">
                      "{e.descripcion}"
                    </td>
                    <td className="px-4 py-3 text-neutral/60 font-mono text-xs">
                      {e.referenciaComprobante ? (
                        <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded">
                          {e.referenciaComprobante}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-primary whitespace-nowrap">
                      {mxn(e.monto)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {actualizarEgreso && (
                        <button
                          type="button"
                          onClick={() => {
                            setEgresoAEditar(e);
                            setModalEditarAbierto(true);
                          }}
                          title="Editar egreso (con bitácora)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition cursor-pointer shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-secondary" />
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal de Edición de Egreso (Con Bitácora) ───────────────────────── */}
      {modalEditarAbierto && egresoAEditar && actualizarEgreso && (
        <ModalEditarEgreso
          egreso={egresoAEditar}
          isOpen={modalEditarAbierto}
          onClose={() => {
            setModalEditarAbierto(false);
            setEgresoAEditar(null);
          }}
          catalogos={catalogos}
          actualizarEgreso={actualizarEgreso}
          onSuccess={() => {
            void consultarEgresos();
          }}
        />
      )}
    </div>
  );
}
