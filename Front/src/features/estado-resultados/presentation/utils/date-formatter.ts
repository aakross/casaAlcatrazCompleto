// ─────────────────────────────────────────────────────────────────────────────
// Utilidad de Fecha — Homologación estricta al formato 'dd/mm/yy'
// Para Estado de Resultados (Casa Alcatraz) utilizando date-fns
// ─────────────────────────────────────────────────────────────────────────────
import { format, parseISO, isValid } from "date-fns";

/**
 * Homologa y formatea estrictamente cualquier valor de fecha al estándar 'dd/mm/yy'.
 * Evita desfaces por zona horaria procesando strings 'YYYY-MM-DD' de forma determinista
 * y recurriendo a date-fns para objetos Date y strings ISO completos.
 * 
 * Ejemplos:
 *  - '2026-10-18'          -> '18/10/26'
 *  - '2026-08-01T00:00:00' -> '01/08/26'
 *  - new Date(2026, 9, 5)  -> '05/10/26'
 */
export const formatearFechaDDMMYY = (
  fecha: string | Date | null | undefined
): string => {
  if (!fecha) return "—";

  try {
    if (typeof fecha === "string") {
      const limpia = fecha.trim().split("T")[0];
      const partes = limpia.split("-");
      // Si cumple con la estructura estándar YYYY-MM-DD
      if (partes.length === 3 && partes[0].length === 4) {
        const [yyyy, mm, dd] = partes;
        const yy = yyyy.slice(-2);
        return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}/${yy}`;
      }
      const parsed = parseISO(fecha);
      if (isValid(parsed)) {
        return format(parsed, "dd/MM/yy");
      }
    }

    if (fecha instanceof Date && isValid(fecha)) {
      return format(fecha, "dd/MM/yy");
    }

    return String(fecha);
  } catch {
    return String(fecha);
  }
};

/**
 * Retorna la fecha local actual del cliente/dispositivo en formato 'YYYY-MM-DD'.
 * Utiliza los métodos getFullYear(), getMonth() y getDate() de la zona horaria
 * local del navegador para evitar el desfase de medianoche UTC a altas horas de la noche.
 */
export const obtenerFechaLocalHoyYYYYMMDD = (): string => {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
