import { useState } from "react";
import { DetalleReserva } from "../components/DetalleReserva";
import { ListaReservas } from "../components/ListaReservas";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";

export const PagosPage = () => {
  const [reservaIdActiva, setReservaIdActiva] = useState<number | null>(null);
  const [listaAbiertaMobile, setListaAbiertaMobile] = useState<boolean>(false);
  const manejarSeleccion = (id: number) => {
    setReservaIdActiva(id);
    setListaAbiertaMobile(false); // Cierra el menú al elegir
  };

  return (
    <div className="w-full p-2 md:p-4 min-h-screen bg-tertiary">
      {/* TÍTULO PRINCIPAL (Siempre visible) */}
      <h1 className="font-headline text-primary text-2xl md:text-3xl mb-4">
        Pagos
      </h1>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start relative">
        {/* === CONTROL DE LISTA PARA MOBILE (ACORDEÓN DESPLEGABLE) === */}
        <div className="w-full md:hidden mb-2">
          <button
            onClick={() => setListaAbiertaMobile(!listaAbiertaMobile)}
            className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-black/5 font-body font-bold text-primary active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-secondary" />
              <span>
                {reservaIdActiva
                  ? "Cambiar de Reserva / Cliente"
                  : "Seleccionar Reserva"}
              </span>
            </div>
            {listaAbiertaMobile ? (
              <ChevronUp className="w-5 h-5 text-primary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary" />
            )}
          </button>

          {/* Lista desplegada en Mobile */}
          {listaAbiertaMobile && (
            <div className="w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20 max-h-[60vh] overflow-y-auto">
              <ListaReservas
                reservaActivaId={reservaIdActiva}
                onSeleccionarId={manejarSeleccion}
              />
            </div>
          )}
        </div>

        {/* === LISTA PARA DESKTOP (FIJA A LA IZQUIERDA COMO ANTES) === */}
        <div className="w-full md:col-span-3 hidden md:block">
          <ListaReservas
            reservaActivaId={reservaIdActiva}
            onSeleccionarId={setReservaIdActiva}
          />
        </div>

        {/* === DETALLE DE RESERVA === */}
        <div className="w-full md:col-span-9">
          {reservaIdActiva !== null ? (
            <DetalleReserva reservaId={reservaIdActiva} />
          ) : (
            <div className="flex w-full h-[40vh] md:h-[50vh] border-2 border-dashed border-gray-200 rounded-xl items-center justify-center text-center p-6 text-gray-400 bg-white font-medium">
              Por favor, selecciona una reserva de la lista para ver su desglose
              completo de pagos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
