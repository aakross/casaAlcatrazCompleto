// ─────────────────────────────────────────────────────────────────────────────
// Page — EstadoResultadosPage
// Navegación modular por pestañas:
// 1. Estado de Resultados (Reporte Ejecutivo Excel limpio sin ceros)
// 2. Detalle y Gráfica de Egresos (Filtros por Tipo de Gasto, Concepto, Fechas y Gráfica)
// 3. Registrar Egreso (Formulario dedicado con validación de descripción)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  BarChart2,
  PlusCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useEstadoResultados } from "../hooks/useEstadoResultados";
import { EstadoResultadosTabla } from "../components/EstadoResultadosTabla";
import { DetalleEgresosView } from "../components/DetalleEgresosView";
import { DetalleExtrasView } from "../components/DetalleExtrasView";
import { FormularioEgreso } from "../components/FormularioEgreso";

type TabId =
  | "estado-resultados"
  | "detalle-extras"
  | "detalle-egresos"
  | "registrar-egreso";

export function EstadoResultadosPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("estado-resultados");

  const hook = useEstadoResultados();

  const {
    estadoResultados,
    aniosDisponibles,
    catalogos,
    filtros,
    isLoading,
    isLoadingCatalogos,
    error,
    cargarEstadoResultados,
    cargarAnios,
    cargarCatalogos,
    consultarDetalleEgresos,
    consultarDetalleExtras,
    consultarConceptosExtras,
    registrarEgreso,
    actualizarEgreso,
    crearConcepto,
    actualizarFiltros,
    resetFiltros,
  } = hook;

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    void cargarAnios();
    void cargarCatalogos();
    void cargarEstadoResultados();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Callback al registrar un egreso con éxito ─────────────────────────────
  const handleEgresoGuardado = () => {
    void cargarEstadoResultados(filtros);
    // Cambiar a la vista de detalle de egresos para ver el gasto recién registrado
    setTabActiva("detalle-egresos");
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado Principal ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-primary text-2xl sm:text-3xl font-bold">
              Módulo Financiero y Egresos
            </h1>
            <p className="font-body text-neutral/60 text-xs sm:text-sm mt-0.5">
              Casa Alcatraz — Estado de Resultados, Detalle Analítico y Registro de Gastos
            </p>
          </div>
        </div>

        {/* Botón de acceso rápido para nuevo gasto */}
        {tabActiva !== "registrar-egreso" && (
          <button
            type="button"
            onClick={() => setTabActiva("registrar-egreso")}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition rounded-xl font-body text-xs font-semibold shadow-xs cursor-pointer w-fit"
          >
            <PlusCircle className="w-4 h-4 text-secondary" />
            + Registrar Nuevo Egreso
          </button>
        )}
      </div>

      {/* ── Selector de Pestañas (Vistas Modulares) ─────────────────────────── */}
      <div className="flex border-b border-neutral/15 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTabActiva("estado-resultados")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold font-body border-b-2 transition whitespace-nowrap cursor-pointer ${
            tabActiva === "estado-resultados"
              ? "border-secondary text-primary font-bold"
              : "border-transparent text-neutral/60 hover:text-primary hover:border-neutral/30"
          }`}
        >
          <FileSpreadsheet
            className={`w-4 h-4 ${
              tabActiva === "estado-resultados"
                ? "text-secondary"
                : "text-neutral/50"
            }`}
          />
          Estado de Resultados
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("detalle-extras")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold font-body border-b-2 transition whitespace-nowrap cursor-pointer ${
            tabActiva === "detalle-extras"
              ? "border-secondary text-primary font-bold"
              : "border-transparent text-neutral/60 hover:text-primary hover:border-neutral/30"
          }`}
        >
          <Sparkles
            className={`w-4 h-4 ${
              tabActiva === "detalle-extras"
                ? "text-secondary"
                : "text-neutral/50"
            }`}
          />
          Detalle y Gráfica de Extras
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("detalle-egresos")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold font-body border-b-2 transition whitespace-nowrap cursor-pointer ${
            tabActiva === "detalle-egresos"
              ? "border-secondary text-primary font-bold"
              : "border-transparent text-neutral/60 hover:text-primary hover:border-neutral/30"
          }`}
        >
          <BarChart2
            className={`w-4 h-4 ${
              tabActiva === "detalle-egresos"
                ? "text-secondary"
                : "text-neutral/50"
            }`}
          />
          Detalle y Gráfica de Egresos
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("registrar-egreso")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold font-body border-b-2 transition whitespace-nowrap cursor-pointer ${
            tabActiva === "registrar-egreso"
              ? "border-secondary text-primary font-bold"
              : "border-transparent text-neutral/60 hover:text-primary hover:border-neutral/30"
          }`}
        >
          <PlusCircle
            className={`w-4 h-4 ${
              tabActiva === "registrar-egreso"
                ? "text-secondary"
                : "text-neutral/50"
            }`}
          />
          Registrar Egreso
        </button>
      </div>

      {/* ── Contenido de la Vista Activa ────────────────────────────────────── */}
      <div className="pt-2">
        {/* Vista 1: Estado de Resultados Ejecutivo (Excel) */}
        {tabActiva === "estado-resultados" && (
          <div className="animate-fade-in">
            <EstadoResultadosTabla
              estadoResultados={estadoResultados}
              aniosDisponibles={aniosDisponibles}
              filtros={filtros}
              isLoading={isLoading}
              error={error}
              actualizarFiltros={actualizarFiltros}
              cargarEstadoResultados={cargarEstadoResultados}
              resetFiltros={resetFiltros}
            />
          </div>
        )}

        {/* Vista 2: Detalle de Extras y Gráfica Sencilla */}
        {tabActiva === "detalle-extras" && (
          <div className="animate-fade-in">
            <DetalleExtrasView
              aniosDisponibles={aniosDisponibles}
              consultarDetalleExtras={consultarDetalleExtras}
              consultarConceptosExtras={consultarConceptosExtras}
            />
          </div>
        )}

        {/* Vista 3: Detalle de Egresos y Gráfica Sencilla */}
        {tabActiva === "detalle-egresos" && (
          <div className="animate-fade-in">
            <DetalleEgresosView
              catalogos={catalogos}
              aniosDisponibles={aniosDisponibles}
              consultarDetalleEgresos={consultarDetalleEgresos}
              actualizarEgreso={actualizarEgreso}
            />
          </div>
        )}

        {/* Vista 3: Formulario Dedicado para Registrar Egreso */}
        {tabActiva === "registrar-egreso" && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <FormularioEgreso
              catalogos={catalogos}
              isLoadingCatalogos={isLoadingCatalogos}
              registrarEgreso={registrarEgreso}
              crearConcepto={crearConcepto}
              onSuccess={handleEgresoGuardado}
            />
          </div>
        )}
      </div>
    </div>
  );
}
