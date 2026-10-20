import { useDetalleReserva } from "../hooks/useDetalleReserva";
import { DetalleExtras } from "./DetalleExtras";
import { CardAnticipos } from "./detalles/CardAnticipo";
import { CardBalancePendiente } from "./detalles/CardBalancePendiente";
import { CardComisiones } from "./detalles/CardComisiones";
import { CardCostoTotal } from "./detalles/CardCostoTotal";
import { CardExtras } from "./detalles/CardExtras";
import { CardGarantia } from "./detalles/CardGarantia";
import { CardGranTotal } from "./detalles/CardGranTotal";
import { HeaderDetalles } from "./detalles/HeaderDetalles";
import { HistorialDePagos } from "./detalles/HistorialDePagos";
import { ConfirmarEliminarPagoModal } from "./detalles/ConfirmarEliminarPagoModal";
import { useState } from "react";
import { IngresoRepository } from "../../infrastructure/ingreso.repository";
import { useAuthStore } from "../../../../core/store/authStore";
import { notify } from "../../../../core/components/notifierTostify";

interface DetalleReservaProps {
  reservaId: number | null;
}

export const DetalleReserva = ({ reservaId }: DetalleReservaProps) => {
  const {
    pagos,
    isLoading,
    datosCliente,
    costoTotal,
    totalPagadoCliente,
    balancePendiente,
    totalComisiones,
    totalExtras,
    montoGarantia,
    granTotalEstancia,
    extrasDesglosados,
    porcentajeComision,
    refrescarPagos,
  } = useDetalleReserva(reservaId);

  // El userId se obtiene en la capa de presentación y se pasa como parámetro al repositorio
  const userId = useAuthStore((state) => state.userId);

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [pagoIdSeleccionado, setPagoIdSeleccionado] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  if (!reservaId) {
    return (
      <div className="p-6 text-gray-400 italic">
        Selecciona una reserva para ver su estado de cuenta.
      </div>
    );
  }

  if (isLoading || !datosCliente) {
    return (
      <div className="p-6 text-gray-400 font-medium">
        Calculando balance de caja...
      </div>
    );
  }

  const comisionTotalDeExtras =
    extrasDesglosados?.reduce((acc: number, item: any) => {
      return acc + (Number(item.montoComision) || 0);
    }, 0) || 0;

  const manejarAbrirBorrarPago = (pagoId: number) => {
    setPagoIdSeleccionado(pagoId);
    setModalDeleteOpen(true);
  };

  const porcentajeExtraComision =
    extrasDesglosados?.find((item: any) => (item.porcentajeComision || 0) > 0)
      ?.porcentajeComision || 0;

  const ejecutarEliminacionPago = async () => {
    if (!pagoIdSeleccionado) return;
    setIsDeleting(true);

    try {
      // userId se pasa como parámetro — el repositorio ya no accede al store de UI
      await IngresoRepository.delete(pagoIdSeleccionado, Number(userId || 1));
      notify.success("¡El abono de caja ha sido eliminado con éxito!");

      setModalDeleteOpen(false);
      setPagoIdSeleccionado(null);
      refrescarPagos();
    } catch (error: any) {
      notify.error(error.message || "Error al intentar eliminar el abono.");
    } finally {
      setIsDeleting(false);
    }
  };

  const manejarEditarPago = (_pago: any) => {
    // Funcionalidad de edición pendiente de implementar
  };

  return (
    <>
      <div className="w-full h-full rounded-lg relative">
        <HeaderDetalles
          cliente={datosCliente}
          onPagoRegistrado={refrescarPagos}
        />
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start justify-center my-5">
          <CardCostoTotal total={costoTotal} />
          <CardAnticipos recibido={totalPagadoCliente} />
          <CardComisiones
            comisiones={totalComisiones}
            porcentaje={porcentajeComision}
          />
          <CardBalancePendiente pendiente={balancePendiente} />

          <CardExtras
            total={totalExtras}
            comisionExtras={comisionTotalDeExtras}
            porcentaje={porcentajeExtraComision}
          />

          <CardGarantia total={montoGarantia} />

          <CardGranTotal total={granTotalEstancia} />
          <DetalleExtras listadoExtras={extrasDesglosados} />
        </div>
        <HistorialDePagos
          listadoPagos={pagos}
          onEditPago={manejarEditarPago}
          onDeletePago={manejarAbrirBorrarPago}
        />
      </div>
      <ConfirmarEliminarPagoModal
        isOpen={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={ejecutarEliminacionPago}
        isSubmitting={isDeleting}
      />
    </>
  );
};
