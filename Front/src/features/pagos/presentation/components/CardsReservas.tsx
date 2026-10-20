import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// 1. Interfaz actualizada reflejando la respuesta real de tu backend
interface CardReservasProps {
  id: number;
  nombreCliente: string;
  apellidoCliente: string;
  fechaInicio: string;
  fechaFin: string;
  origenNombre: string; // Mapeado a lo que antes llamabas plataforma
  montoTotal: number; // Mapeado a precio
  montoPagado: number;
  saldoPendiente: number;
  totalDiasReservacion: number; // Mapeado a noches
  personasHospedadas: number;
  estatusPago: string;
  isSelected: boolean;
  onSelect?: () => void;
}

const formatearRangoFechas = (inicio: string, fin: string) => {
  try {
    const dateInicio = parseISO(inicio);
    const dateFin = parseISO(fin);

    const txtInicio = format(dateInicio, "dd MMM", { locale: es });
    const txtFin = format(dateFin, "dd MMM", { locale: es });

    return `${txtInicio} - ${txtFin}`;
  } catch {
    return "Fechas no válidas";
  }
};

const PLATAFORMA_COLORS: Record<string, string> = {
  "OhSunny!": "bg-ohsunny",
  Web: "bg-primary",
  Booking: "bg-blue-600",
};

export const CardsReservas = ({
  id,
  nombreCliente,
  apellidoCliente,
  fechaInicio,
  fechaFin,
  origenNombre,
  montoTotal,
  // montoPagado,
  saldoPendiente,
  // totalDiasReservacion,
  // personasHospedadas,
  estatusPago,
  isSelected,
  onSelect,
}: CardReservasProps) => {
  const formatPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  // Limpiamos los espacios en blanco que vienen del backend
  const plataformaLimpia = origenNombre.trim();
  const badgePlataformaBg =
    PLATAFORMA_COLORS[plataformaLimpia] || "bg-gray-500";

  // Estilos dinámicos para el estatus del pago usando tu paleta
  const esPagadoCompleto = estatusPago.toLowerCase() === "pagado";
  const badgePagoEstilo = esPagadoCompleto
    ? "bg-primary/10 text-primary border border-primary/30"
    : "bg-error/10 text-error border border-error/30";

  // Reemplaza el bloque de tu return por este diseño protegido:

  return (
    <div
      onClick={onSelect}
      className={`w-full rounded-lg p-4 cursor-pointer transition-all border-l-4 shadow-md flex flex-col gap-3
      ${
        isSelected
          ? "bg-primary/10 border-l-primary ring-1 ring-primary/20"
          : "bg-surfacecontainer border-l-surface hover:border-l-secondary"
      }`}
    >
      {/* Fila Superior: Cliente, Origen y Estatus de Pago */}
      {/* 🌟 Añadimos 'min-w-0' aquí para que los elementos hijos puedan contraerse */}
      <div className="w-full flex items-start justify-between gap-3 min-w-0">
        {/* 🌟 CORRECCIÓN 1: Forzamos al contenedor izquierdo a ser flexible pero con un mínimo de cero */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Usamos 'truncate' por si el nombre del cliente también llega a ser extremadamente largo */}
          <span className="font-headline font-bold text-lg text-neutral leading-tight truncate">
            {nombreCliente} {apellidoCliente}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {formatearRangoFechas(fechaInicio, fechaFin)}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Folio Reserva: {id}
          </span>
        </div>

        {/* 🌟 CORRECCIÓN 2: El contenedor de badges se queda rígido al extremo derecho */}
        {/* Añadimos 'max-w-[120px]' para que si el texto es inmenso, no intente devorarse toda la tarjeta */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 max-w-[120px] min-w-0">
          {/* Badge de Origen (Plataforma) */}
          {/* Usamos 'break-words whitespace-normal text-center' para que si dice algo largo, salte de renglón bonito */}
          <span
            className={`px-2 py-0.5 rounded text-xxs font-bold text-white tracking-wide text-center break-words whitespace-normal w-full ${badgePlataformaBg}`}
          >
            {plataformaLimpia}
          </span>

          {/* Badge de Estatus de Pago */}
          <span
            className={`px-2 py-0.5 rounded text-xxs font-semibold uppercase tracking-wider text-center break-words whitespace-normal w-full ${badgePagoEstilo}`}
          >
            {estatusPago}
          </span>
        </div>
      </div>

      {/* Fila Inferior: Desglose Financiero */}
      <div className="flex items-center justify-between pt-0.5 hidden">
        {saldoPendiente > 0 ? (
          <div className="flex flex-col">
            <span className="text-xxs text-gray-400 uppercase font-bold tracking-wider">
              Por Pagar
            </span>
            <span className="text-sm font-bold text-error">
              {formatPrecio(saldoPendiente)}
            </span>
          </div>
        ) : (
          <div className="text-xs font-semibold text-primary flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Liquidado
          </div>
        )}

        <div className="flex flex-col items-end">
          <span className="text-xxs text-gray-400 uppercase font-bold tracking-wider">
            Total
          </span>
          <span className="text-base font-black text-neutral">
            {formatPrecio(montoTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
