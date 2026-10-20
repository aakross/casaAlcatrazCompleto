// src/features/reservacion/presentation/hooks/useCalendarioOcupacion.ts
import { useEffect, useState } from "react";
import { type FechasOcupadas } from "../../domain/fechas-ocupadas.repository";
import { ApiFechasOcupadasRepository } from "../../infrastructure/api-fechas-ocupadas.repository";

export type EstadoDiaCalendario =
  | "disponible"
  | "ocupado"
  | "checkIn"
  | "checkOut"
  | "checkInAndCheckOut";

export const useCalendarioOcupacion = (
  reservaIdEdicion: number | null = null,
) => {
  const [datosOcupacion, setDatosOcupacion] = useState<FechasOcupadas[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const repo = new ApiFechasOcupadasRepository();
    repo
      .obtenerOcupadas()
      .then((data) => setDatosOcupacion(data))
      .catch((err) => console.error("Error cargando calendario", err))
      .finally(() => setLoading(false));
  }, []);

  // Normalizar fecha sin horas para comparaciones exactas
  const normalizarFecha = (d: Date) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const ocupacionFiltrada = datosOcupacion.filter((reserva) => {
    return !reservaIdEdicion || (reserva as any).id !== reservaIdEdicion;
  });

  // Determinar el estado de un día específico
  const obtenerEstadoDia = (fecha: Date): EstadoDiaCalendario => {
    const t = normalizarFecha(fecha);
    let isCheckIn = false;
    let isCheckOut = false;
    let isFullDay = false;

    for (const r of ocupacionFiltrada) {
      const inicio = normalizarFecha(r.fechaDesde);
      const fin = normalizarFecha(r.fechaHasta);

      if (t === inicio) isCheckIn = true;
      if (t === fin) isCheckOut = true;
      if (t > inicio && t < fin) isFullDay = true;
    }

    // Si coincide con salida de un huésped y entrada de otro el mismo día
    if (isCheckIn && isCheckOut) return "checkInAndCheckOut";
    if (isFullDay) return "ocupado";
    if (isCheckIn) return "checkIn";
    if (isCheckOut) return "checkOut";
    return "disponible";
  };

  // Días que tienen ocupación total o parcial
  const diasOcupados: Date[] = [];
  const diasCheckIn: Date[] = [];
  const diasCheckOut: Date[] = [];
  const diasCambio: Date[] = [];
  const diasOcupadosCompletos: Date[] = [];

  for (const r of ocupacionFiltrada) {
    let curr = new Date(r.fechaDesde.getFullYear(), r.fechaDesde.getMonth(), r.fechaDesde.getDate());
    const fin = new Date(r.fechaHasta.getFullYear(), r.fechaHasta.getMonth(), r.fechaHasta.getDate());

    while (curr <= fin) {
      const st = obtenerEstadoDia(curr);
      const dCopy = new Date(curr);

      if (!diasOcupados.some((d) => normalizarFecha(d) === normalizarFecha(dCopy))) {
        diasOcupados.push(dCopy);
      }

      if (st === "checkIn" && !diasCheckIn.some((d) => normalizarFecha(d) === normalizarFecha(dCopy))) {
        diasCheckIn.push(dCopy);
      } else if (st === "checkOut" && !diasCheckOut.some((d) => normalizarFecha(d) === normalizarFecha(dCopy))) {
        diasCheckOut.push(dCopy);
      } else if (st === "checkInAndCheckOut" && !diasCambio.some((d) => normalizarFecha(d) === normalizarFecha(dCopy))) {
        diasCambio.push(dCopy);
      } else if (st === "ocupado" && !diasOcupadosCompletos.some((d) => normalizarFecha(d) === normalizarFecha(dCopy))) {
        diasOcupadosCompletos.push(dCopy);
      }

      curr.setDate(curr.getDate() + 1);
    }
  }

  const checkoutsDelHotel = ocupacionFiltrada.map((reserva) => {
    return new Date(
      reserva.fechaHasta.getFullYear(),
      reserva.fechaHasta.getMonth(),
      reserva.fechaHasta.getDate(),
    );
  });

  const buscarDetalleDia = (fecha: Date): FechasOcupadas | undefined => {
    const tiempoEvaluar = normalizarFecha(fecha);

    return ocupacionFiltrada.find((reserva) => {
      const inicio = normalizarFecha(reserva.fechaDesde);
      const fin = normalizarFecha(reserva.fechaHasta);
      return tiempoEvaluar >= inicio && tiempoEvaluar <= fin;
    });
  };

  const buscarReservasDelDia = (fecha: Date): FechasOcupadas[] => {
    const tiempoEvaluar = normalizarFecha(fecha);

    return ocupacionFiltrada.filter((reserva) => {
      const inicio = normalizarFecha(reserva.fechaDesde);
      const fin = normalizarFecha(reserva.fechaHasta);
      return tiempoEvaluar >= inicio && tiempoEvaluar <= fin;
    });
  };

  return {
    diasOcupados,
    diasCheckIn,
    diasCheckOut,
    diasCambio,
    diasOcupadosCompletos,
    obtenerEstadoDia,
    buscarDetalleDia,
    buscarReservasDelDia,
    loading,
    checkoutsDelHotel,
  };
};
