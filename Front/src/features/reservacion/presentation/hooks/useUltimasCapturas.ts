import { useState, useEffect, useCallback } from "react";
import {
  ReservaRepository,
  type ReservaApiResponse,
} from "../../infrastructure/reservas.repository";
import { notify } from "../../../../core/components/notifierTostify";
import { useAuthStore } from "../../../../core/store/authStore";

export const useUltimasCapturas = () => {
  const [reservas, setReservas] = useState<ReservaApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [reservaIdSeleccionada, setReservaIdSeleccionada] = useState<
    number | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cargarCapturas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ReservaRepository.getAll();

      // setReservas(data.slice(0, 5));
      setReservas(data);
    } catch (error) {
      console.error("Error al cargar las últimas capturas de reservas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCapturas();
  }, [cargarCapturas]);

  const abrirConfirmarBorrado = (id: number) => {
    setReservaIdSeleccionada(id);
    setModalDeleteOpen(true);
  };

  const cerrarModalBorrado = () => {
    setModalDeleteOpen(false);
    setReservaIdSeleccionada(null);
  };

  // 🌟 METODO REFACTURADO: Orquesta la purga y auto-refresca las capturas
  const ejecutarEliminacion = async () => {
    if (!reservaIdSeleccionada) return;
    setIsDeleting(true);

    try {
      const currentUserId = useAuthStore.getState().userId;
      await ReservaRepository.delete(reservaIdSeleccionada, Number(currentUserId || 1));
      notify.success(
        `¡La reservación #${reservaIdSeleccionada} ha sido completamente eliminada!`,
      );

      cerrarModalBorrado();
      await cargarCapturas(); // 🚀 Se auto-refresca internamente al instante
    } catch (error: any) {
      notify.error(error.message || "No se pudo procesar la eliminación.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    reservas,
    isLoading,
    refrescarCapturas: cargarCapturas,
    deleteModal: {
      isOpen: modalDeleteOpen,
      reservaId: reservaIdSeleccionada,
      isSubmitting: isDeleting,
      abrir: abrirConfirmarBorrado,
      cerrar: cerrarModalBorrado,
      confirmar: ejecutarEliminacion,
    },
  };
};
