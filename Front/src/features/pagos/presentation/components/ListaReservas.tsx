import { useEffect, useState, useMemo } from "react";
import { useListaReservas } from "../hooks/useListaReservas";
import { CardsReservas } from "./CardsReservas";

interface ListaReservasProps {
  reservaActivaId: number | null;
  onSeleccionarId: (id: number) => void;
}

type TipoFiltro = "todos" | "pagado" | "pendiente";

export const ListaReservas = ({
  reservaActivaId,
  onSeleccionarId,
}: ListaReservasProps) => {
  const { reservas, isLoading } = useListaReservas();

  const [filtroEstatus, setFiltroEstatus] = useState<TipoFiltro>("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((reserva) => {
      const nombreCompleto =
        `${reserva.nombreCliente} ${reserva.apellidoCliente}`.toLowerCase();
      const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase());

      const estatusBackend = reserva.estatusPago.toLowerCase().trim();
      const coincideFiltro =
        filtroEstatus === "todos" || estatusBackend === filtroEstatus;

      return coincideBusqueda && coincideFiltro;
    });
  }, [reservas, busqueda, filtroEstatus]);

  useEffect(() => {
    if (reservasFiltradas.length > 0) {
      const activaSigueVisible = reservasFiltradas.some(
        (r) => r.id === reservaActivaId,
      );
      if (!activaSigueVisible) {
        onSeleccionarId(reservasFiltradas[0].id);
      }
    }
  }, [reservasFiltradas, reservaActivaId, onSeleccionarId]);

  if (isLoading) {
    return (
      <div className="bg-white w-full max-w-md rounded-lg p-8 shadow-sm border border-black/5 flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-surface font-medium italic">
          Cargando reservas...
        </p>
      </div>
    );
  }
  return (
    <div className="bg-white w-full md:max-w-md h-fit rounded-lg flex flex-col items-start justify-start p-4 gap-4 shadow-sm border border-black/5">
      <div className="w-full">
        <span className="block text-center md:text-left font-headline text-lg font-bold text-primary">
          Lista de Reservas
        </span>
      </div>

      <div className="w-full relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-surfacecontainer font-body text-neutral rounded-lg border border-gray-200 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 w-full text-center text-xs md:text-sm font-label font-bold border-b border-gray-100 pb-1">
        <button
          onClick={() => setFiltroEstatus("todos")}
          className={`pb-2 transition-all cursor-pointer border-b-2 ${
            filtroEstatus === "todos"
              ? "text-primary border-secondary"
              : "text-gray-400 border-transparent hover:text-surface"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstatus("pagado")}
          className={`pb-2 transition-all cursor-pointer border-b-2 ${
            filtroEstatus === "pagado"
              ? "text-primary border-secondary"
              : "text-gray-400 border-transparent hover:text-surface"
          }`}
        >
          Pagados
        </button>
        <button
          onClick={() => setFiltroEstatus("pendiente")}
          className={`pb-2 transition-all cursor-pointer border-b-2 ${
            filtroEstatus === "pendiente"
              ? "text-primary border-secondary"
              : "text-gray-400 border-transparent hover:text-surface"
          }`}
        >
          Pendientes
        </button>
      </div>

      <div className="w-full flex flex-col gap-3 max-h-[50vh] md:max-h-[65vh] overflow-y-auto pr-1">
        {reservasFiltradas.length === 0 ? (
          <div className="text-sm text-gray-400 font-medium italic p-6 text-center w-full bg-surfacecontainer rounded-lg font-body">
            No se encontraron reservas.
          </div>
        ) : (
          reservasFiltradas.map((reserva) => (
            <CardsReservas
              key={reserva.id}
              id={reserva.id}
              nombreCliente={reserva.nombreCliente}
              apellidoCliente={reserva.apellidoCliente}
              fechaInicio={reserva.fechaInicio}
              fechaFin={reserva.fechaFin}
              origenNombre={reserva.origenNombre}
              montoTotal={reserva.montoTotal}
              montoPagado={reserva.montoPagado}
              saldoPendiente={reserva.saldoPendiente}
              totalDiasReservacion={reserva.totalDiasReservacion}
              personasHospedadas={reserva.personasHospedadas}
              estatusPago={reserva.estatusPago}
              isSelected={reservaActivaId === reserva.id}
              onSelect={() => onSeleccionarId(reserva.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
