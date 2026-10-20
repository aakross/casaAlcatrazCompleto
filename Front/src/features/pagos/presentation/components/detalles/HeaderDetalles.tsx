import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { RegistrarPagoForm } from "../FormularioPagos";
import { Plus } from "lucide-react";
import {
  useFormularioPagos,
  // type PagoFormValues,
} from "../../hooks/useFormularioPagos";

interface ClienteProps {
  nombreCompleto: string;
  folio: string | number;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  precioNoche: number;
}

interface HeaderDetallesProps {
  cliente: ClienteProps;
  onPagoRegistrado: () => void;
}

export const HeaderDetalles = ({
  cliente,
  onPagoRegistrado,
}: HeaderDetallesProps) => {
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);

  const formularioProps = useFormularioPagos({
    reservacionId:
      typeof cliente?.folio === "string"
        ? parseInt(cliente.folio, 10)
        : cliente?.folio || 0,
    onExito: () => {
      setModalAbierto(false);
      onPagoRegistrado();
    },
  });

  if (!cliente) return null;

  const iniciales = cliente.nombreCompleto
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatearFecha = (fechaStr: string) => {
    try {
      return format(parseISO(fechaStr), "dd MMM, yyyy", { locale: es });
    } catch {
      return fechaStr;
    }
  };

  const formatearPrecio = (monto: number) => {
    return Number(monto || 0).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-white rounded-lg w-full flex flex-col md:grid md:grid-cols-[auto_1fr_auto_auto] gap-4 md:gap-6 p-4 md:p-10 shadow-sm border border-black/5 items-center">
      <div className="flex items-center gap-4 w-full md:w-auto md:contents">
        <div className="bg-primary w-fit aspect-square rounded-full text-secondary font-headline flex items-center justify-center p-3 text-2xl md:text-4xl min-w-[55px] md:min-w-[70px]">
          {iniciales}
        </div>
        {/* Textos Centrales */}
        <div className="flex-1 md:grid md:grid-cols-1">
          <div className="text-primary font-headline text-base md:text-lg font-bold">
            {cliente.nombreCompleto}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-0.5">
            Reserva: #{cliente.folio}{" "}
            <span className="block sm:inline md:block lg:inline">
              • Fechas: {formatearFecha(cliente.fechaInicio)} -{" "}
              {formatearFecha(cliente.fechaFin)}
            </span>
            <br />
            <span className="block sm:inline md:block lg:inline">
              • Precio por Noche:{" "}
              <strong className="text-primary font-semibold">
                {formatearPrecio(cliente.precioNoche)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <hr className="md:hidden border-t border-gray-100 w-full" />

      <div className="text-neutral flex flex-row md:grid justify-between md:justify-center items-center w-full md:w-auto md:min-w-[120px] gap-2">
        <div className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-400 text-center uppercase">
          Estatus
        </div>
        <div
          className={`rounded-lg py-1 font-bold text-center text-xs md:text-sm px-3 ${
            /* NUEVA CONDICIÓN: Si está Liquidado o Finalizado, se muestra en verde */
            cliente.estado === "Liquidado" || cliente.estado === "Finalizado"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-error/20 text-error"
          }`}
        >
          {cliente.estado}
        </div>
      </div>

      <button
        onClick={() => setModalAbierto(true)}
        className="flex items-center justify-center gap-2 bg-primary text-secondary w-full md:w-auto px-4 py-2.5 md:py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity h-fit"
      >
        <Plus className="w-4 h-4" />
        <span>Agregar pago</span>
      </button>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white p-6 rounded-t-xl sm:rounded-lg shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-medium"
            >
              Cerrar
            </button>
            <div className="mt-4">
              <RegistrarPagoForm {...formularioProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
