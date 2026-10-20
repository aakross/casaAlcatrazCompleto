// ─────────────────────────────────────────────────────────────────────────────
// Presentation Hook — useEstadoResultados
// Orquesta todos los casos de uso del módulo Estado de Resultados.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";
import { EstadoResultadosRepository } from "../../infrastructure/api-estado-resultados.repository";
import { useAuthStore } from "../../../../core/store/authStore";
import type {
  EstadoResultadosData,
  CatalogosData,
  FiltrosEstadoResultados,
  RegistrarEgresoPayload,
  ActualizarEgresoPayload,
  CrearConceptoPayload,
  RegistrarProvisionIsrPayload,
  UltimoEgreso,
  FiltrosDetalleEgresos,
  EgresoDetalleItem,
  FiltrosDetalleExtras,
  ExtraDetalleItem,
} from "../../domain/estado-resultados.repository";

// ── Año actual como valor por defecto ────────────────────────────────────────
const anioActual = new Date().getFullYear();

const filtrosIniciales: FiltrosEstadoResultados = {
  anio: anioActual,
};

export function useEstadoResultados() {
  // ── Estado principal ──────────────────────────────────────────────────────
  const [estadoResultados, setEstadoResultados] =
    useState<EstadoResultadosData | null>(null);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosData>({
    categorias: [],
    conceptos: [],
  });
  const [ultimosEgresos, setUltimosEgresos] = useState<UltimoEgreso[]>([]);
  const [filtros, setFiltros] =
    useState<FiltrosEstadoResultados>(filtrosIniciales);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCatalogos, setIsLoadingCatalogos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Obtener el estado de resultados con los filtros actuales ──────────────
  const cargarEstadoResultados = useCallback(
    async (filtrosOverride?: FiltrosEstadoResultados) => {
      const filtrosAUsar = filtrosOverride ?? filtros;
      setIsLoading(true);
      setError(null);
      try {
        const data =
          await EstadoResultadosRepository.getEstadoResultados(filtrosAUsar);
        setEstadoResultados(data);
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "Error al cargar el reporte.";
        setError(mensaje);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [filtros]
  );

  // ── Cargar años disponibles ───────────────────────────────────────────────
  const cargarAnios = useCallback(async () => {
    try {
      const anios = await EstadoResultadosRepository.getAniosDisponibles();
      // Asegurar que el año actual siempre aparezca aunque no haya datos
      const set = new Set([anioActual, ...anios]);
      setAniosDisponibles(Array.from(set).sort((a, b) => b - a));
    } catch {
      setAniosDisponibles([anioActual]);
    }
  }, []);

  // ── Cargar catálogos (categorías + conceptos) ─────────────────────────────
  const cargarCatalogos = useCallback(async () => {
    setIsLoadingCatalogos(true);
    try {
      const data = await EstadoResultadosRepository.getCatalogos();
      setCatalogos(data);
    } finally {
      setIsLoadingCatalogos(false);
    }
  }, []);

  // ── Cargar últimos egresos ────────────────────────────────────────────────
  const cargarUltimosEgresos = useCallback(async (limite = 10) => {
    try {
      const data = await EstadoResultadosRepository.getUltimosEgresos(limite);
      setUltimosEgresos(data);
    } catch {
      // silencioso: es un panel secundario
    }
  }, []);

  // ── Registrar un egreso ───────────────────────────────────────────────────
  const registrarEgreso = useCallback(
    async (
      payload: Omit<RegistrarEgresoPayload, "usuarioId">
    ): Promise<void> => {
      const usuarioId = useAuthStore.getState().userId ?? 0;
      await EstadoResultadosRepository.registrarEgreso({
        ...payload,
        usuarioId,
      });
    },
    []
  );

  // ── Actualizar un egreso con bitácora ─────────────────────────────────────
  const actualizarEgreso = useCallback(
    async (
      payload: Omit<ActualizarEgresoPayload, "usuarioId" | "usuarioNombre">
    ): Promise<void> => {
      const authState = useAuthStore.getState();
      const usuarioId = authState.userId ?? 1;
      const usuarioNombre = authState.username ?? "Usuario";
      await EstadoResultadosRepository.actualizarEgreso({
        ...payload,
        usuarioId,
        usuarioNombre,
      });
    },
    []
  );

  // ── Crear un concepto nuevo ───────────────────────────────────────────────
  const crearConcepto = useCallback(
    async (payload: Omit<CrearConceptoPayload, "usuarioId">) => {
      const usuarioId = useAuthStore.getState().userId ?? 0;
      const nuevo = await EstadoResultadosRepository.crearConcepto({
        ...payload,
        usuarioId,
      });
      // Refrescamos catálogos localmente para que el select lo muestre
      setCatalogos((prev) => ({
        ...prev,
        conceptos: [...prev.conceptos, nuevo],
      }));
      return nuevo;
    },
    []
  );

  // ── Registrar provisión de ISR ────────────────────────────────────────────
  const registrarProvisionIsr = useCallback(
    async (
      payload: Omit<RegistrarProvisionIsrPayload, "usuarioId">
    ): Promise<void> => {
      const usuarioId = useAuthStore.getState().userId ?? 0;
      await EstadoResultadosRepository.registrarProvisionIsr({
        ...payload,
        usuarioId,
      });
    },
    []
  );

  // ── Consultar detalle analítico de egresos ───────────────────────────────
  const consultarDetalleEgresos = useCallback(
    async (filtrosDetalle: FiltrosDetalleEgresos): Promise<EgresoDetalleItem[]> => {
      return await EstadoResultadosRepository.getDetalleEgresos(filtrosDetalle);
    },
    []
  );

  // ── Consultar detalle analítico de extras ─────────────────────────────────
  const consultarDetalleExtras = useCallback(
    async (filtrosDetalle: FiltrosDetalleExtras): Promise<ExtraDetalleItem[]> => {
      return await EstadoResultadosRepository.getDetalleExtras(filtrosDetalle);
    },
    []
  );

  // ── Obtener lista de conceptos de extras existentes ───────────────────────
  const consultarConceptosExtras = useCallback(async (): Promise<string[]> => {
    return await EstadoResultadosRepository.getConceptosExtras();
  }, []);

  // ── Actualizar filtros parcialmente ──────────────────────────────────────
  const actualizarFiltros = useCallback(
    (parcial: Partial<FiltrosEstadoResultados>) => {
      setFiltros((prev) => ({ ...prev, ...parcial }));
    },
    []
  );

  const resetFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
  }, []);

  return {
    // Estado
    estadoResultados,
    aniosDisponibles,
    catalogos,
    ultimosEgresos,
    filtros,
    isLoading,
    isLoadingCatalogos,
    error,
    // Acciones
    cargarEstadoResultados,
    cargarAnios,
    cargarCatalogos,
    cargarUltimosEgresos,
    consultarDetalleEgresos,
    consultarDetalleExtras,
    consultarConceptosExtras,
    registrarEgreso,
    actualizarEgreso,
    crearConcepto,
    registrarProvisionIsr,
    actualizarFiltros,
    resetFiltros,
  };
}
