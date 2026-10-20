import { useState, useEffect, useCallback } from "react";
import {
  type FilaReporteFinanciero,
  type FiltrosReporteParams,
} from "../../domain/reportes.repository";
import { ApiReportesRepository } from "../../infrastructure/repositories/api-reportes";

// Instanciamos el repositorio de infraestructura de forma limpia
const reporteRepository = new ApiReportesRepository();

export const useReporteGeneral = () => {
  const [datosReporte, setDatosReporte] = useState<FilaReporteFinanciero[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filtros, setFiltros] = useState<FiltrosReporteParams>({
    fechaDesde: "",
    fechaHasta: "",
    estatusId: null,
  });

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reporteRepository.obtenerGeneral(filtros);
      setDatosReporte(data);
    } catch (error) {
      console.error("Error al compilar la sábana de reportes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosReporteParams>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  };

  return {
    datosReporte,
    isLoading,
    filtros,
    actualizarFiltros,
    refrescarReporte: cargarDatos,
  };
};
