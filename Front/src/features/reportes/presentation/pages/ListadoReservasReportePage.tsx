import { useState } from "react";
import { useReporteGeneral } from "../hooks/useReporteGeneral";
import { TablaExcelReporte } from "../components/TablaExcelReporte";
import { ExcelExportService } from "../../infrastructure/repositories/excel-export.service";

export function ListadoReservasReportePage() {
  const { datosReporte, isLoading, filtros, actualizarFiltros } =
    useReporteGeneral();
  const [filtroTexto, setFiltroTexto] = useState("");

  // Filtrado reactivo local por coincidencia de nombre o folio (Buscador instantáneo)
  const reporteFiltradoRealtime = datosReporte.filter((fila) => {
    const coincideCliente = fila.cliente
      .toLowerCase()
      .includes(filtroTexto.toLowerCase());
    const coincideFolio = fila.numeroReserva.toString() === filtroTexto;
    return filtroTexto === "" || coincideCliente || coincideFolio;
  });

  const handleExportarExcel = () => {
    if (reporteFiltradoRealtime.length === 0) return;
    ExcelExportService.exportarAuditoria(reporteFiltradoRealtime);
  };

  return (
    <div className="bg-tertiary min-h-full flex flex-col gap-6 font-body">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black/5 pb-5">
        <div>
          <h2 className="font-headline text-3xl font-bold text-primary tracking-wide">
            Auditoría Financiera Integral
          </h2>
          <p className="text-xs text-surface font-medium mt-1">
            Libro de balances consolidados, comisiones de plataformas y extras
            de Casa Alcatraz.
          </p>
        </div>
      </div>

      <button
        onClick={handleExportarExcel}
        disabled={reporteFiltradoRealtime.length === 0}
        className={`px-4 py-2.5 rounded-lg font-bold text-sm tracking-wide text-white bg-primary hover:bg-surface border border-secondary transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {/* Icono de descarga minimalista */}
        <svg
          className="w-4 h-4 text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Exportar a Excel</span>
      </button>

      {/* Sábana de Filtros Combinados (Direccionados al Backend y Frontend) */}
      <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-black/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Filtro Texto (Local) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral uppercase tracking-wider">
            Buscar Huésped
          </label>
          <input
            type="text"
            placeholder="Nombre o # Folio..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surfacecontainer rounded-lg border border-gray-200 outline-none focus:border-secondary transition-all text-neutral font-medium"
          />
        </div>

        {/* Filtro Fecha Desde (Backend) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral uppercase tracking-wider">
            Desde Fecha
          </label>
          <input
            type="date"
            value={filtros.fechaDesde || ""}
            onChange={(e) =>
              actualizarFiltros({ fechaDesde: e.target.value || null })
            }
            className="w-full px-3 py-2 text-sm bg-surfacecontainer rounded-lg border border-gray-200 outline-none focus:border-secondary transition-all text-neutral font-medium"
          />
        </div>

        {/* Filtro Fecha Hasta (Backend) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral uppercase tracking-wider">
            Hasta Fecha
          </label>
          <input
            type="date"
            value={filtros.fechaHasta || ""}
            onChange={(e) =>
              actualizarFiltros({ fechaHasta: e.target.value || null })
            }
            className="w-full px-3 py-2 text-sm bg-surfacecontainer rounded-lg border border-gray-200 outline-none focus:border-secondary transition-all text-neutral font-medium"
          />
        </div>

        {/* Filtro Estatus Transaccional (Backend) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-neutral uppercase tracking-wider">
            Estatus Caja
          </label>
          <select
            value={filtros.estatusId || ""}
            onChange={(e) =>
              actualizarFiltros({
                estatusId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 text-sm bg-surfacecontainer rounded-lg border border-gray-200 outline-none focus:border-secondary transition-all text-neutral font-medium"
          >
            <option value="">Todos los Estados</option>
            <option value="1">Pendientes de Cobro</option>
            <option value="2">Cuentas Liquidadas / Finalizadas</option>
          </select>
        </div>
      </div>

      {/* Renderizado de la Grid Excel */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 bg-white rounded-xl border border-black/5 shadow-sm">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-surface italic">
            Calculando balances y conciliando comisiones...
          </p>
        </div>
      ) : (
        <TablaExcelReporte filas={reporteFiltradoRealtime} />
      )}
    </div>
  );
}
