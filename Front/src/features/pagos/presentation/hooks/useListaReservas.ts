import { useState, useEffect } from "react";
import {
  ReservaRepository,
  type ReservaApiResponse,
} from "../../../reservacion/infrastructure/reservas.repository";

export const useListaReservas = () => {
  const [reservas, setReservas] = useState<ReservaApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cargarReservas = async () => {
      setIsLoading(true);
      try {
        const data = await ReservaRepository.getAll();
        setReservas(data); // Guarda todas las reservas de la base de datos
      } catch (error) {
        console.error(
          "Error al cargar el listado completo de reservas:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    cargarReservas();
  }, []);

  return {
    reservas,
    isLoading,
  };
};
