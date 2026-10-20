import { useState, useEffect } from "react";
import {
  type BitacoraItem,
  type ExtraEliminado,
} from "../../domain/bitacora.repository";
import { bitacoraRepository } from "../../infrastructure/api-bitacora.repository";

// Re-exportamos para compatibilidad con componentes que importan estos tipos desde el hook
export type { BitacoraItem, ExtraEliminado };

export const useBitacoraBorrados = () => {
  const [logs, setLogs] = useState<BitacoraItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarBitacora = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await bitacoraRepository.obtenerBitacora();
      setLogs(data);
    } catch (err: any) {
      const mensajeError =
        err.response?.data?.error || err.message || "Error inesperado";
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBitacora();
  }, []);

  return { logs, loading, error, recargar: cargarBitacora };
};
