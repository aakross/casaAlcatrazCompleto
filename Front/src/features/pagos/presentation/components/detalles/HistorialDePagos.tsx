import { Info, Pencil, Trash2, Wallet } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { type IngresoApiResponse } from "../../../infrastructure/ingreso.repository";
import { useAuthStore } from "../../../../../core/store/authStore";

interface HistorialDePagosProps {
  listadoPagos: IngresoApiResponse[];
  onEditPago?: (pago: IngresoApiResponse) => void;
  onDeletePago?: (pagoId: number) => void;
}

export const HistorialDePagos = ({
  listadoPagos,
  onEditPago,
  onDeletePago,
}: HistorialDePagosProps) => {
  const puedeBorrar = useAuthStore((state) => state.puedeBorrar) ?? false;
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  const formatearFecha = (fechaStr: string) => {
    try {
      // Cortamos por la 'T' para obtener solo la parte 'YYYY-MM-DD'
      // Esto evita desfaces de días por zonas horarias del navegador al usar parseISO
      const fechaLimpia = fechaStr.split("T")[0];
      return format(parseISO(fechaLimpia), "dd 'de' MMMM, yyyy", {
        locale: es,
      });
    } catch {
      return fechaStr;
    }
  };

  // Suma total de los montos abonados
  const totalPagado = listadoPagos.reduce(
    (sum, item) => sum + item.montoNetoPago,
    0,
  );

  return (
    <div className="bg-surfacecontainer w-full rounded-2xl p-5 shadow-sm border border-black/5 flex flex-col gap-4 mt-2">
      <h3 className="font-headline text-lg font-bold text-primary">
        Historial de Pagos
      </h3>

      {/* Contenedor de Filas Dinámicas */}
      <div className="flex flex-col gap-2 max-h-[35vh] overflow-y-auto pr-1">
        {listadoPagos.length === 0 ? (
          <div className="text-xs text-gray-400 italic p-4 text-center">
            No hay abonos registrados para esta reservación.
          </div>
        ) : (
          listadoPagos.map((pago, index) => (
            <div
              key={`${pago.id || pago.conceptoDePagoId}-${index}`}
              className="w-full flex flex-row items-center justify-between bg-white p-3 md:p-4 rounded-xl shadow-xs border border-gray-100 gap-4 hover:shadow-md transition-shadow"
            >
              {/* Bloque Izquierdo: Icono e Información del Abono */}
              <div className="flex items-start gap-2 md:gap-4 min-w-0 flex-1">
                {/* Icono de billetera */}
                <div className="bg-tertiary p-2 md:p-3 rounded-xl text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4 md:w-5 h-5" />
                </div>

                {/* Textos Informativos */}
                <div className="flex flex-col min-w-0">
                  <span className="font-body font-semibold text-neutral text-xs md:text-base truncate text-black">
                    {pago.conceptoPago}
                  </span>

                  <span className="font-label text-[11px] md:text-xs text-neutral mt-0.5">
                    <span className="font-bold text-secondary">Depósito:</span>{" "}
                    {formatearFecha(
                      pago.fechaDeposito || pago.fechaRegistroPago,
                    )}
                  </span>

                  {/* 🌟 ACOMODO DE FECHA SECUNDARIA: Cuándo se cargó al sistema de la casa */}
                  <span className="font-label text-[10px] md:text-[11px] text-neutral/60 mt-0.5 italic">
                    Registrado el: {formatearFecha(pago.fechaRegistroPago)}
                  </span>

                  {/* DESGLOSE DE COMISIÓN: Solo aparece si aplicaComisionPago es true */}
                  {pago.aplicaComisionPago && (
                    <div className="flex items-center gap-1 mt-1.5 bg-amber-50 border border-amber-200 text-[10px] md:text-xs text-amber-700 px-2 py-0.5 rounded-md w-fit font-medium">
                      <Info className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>
                        Pagado: {formatPrecio(pago.montoBrutoPago)} • Comis: -
                        {formatPrecio(pago.montoComisionPago)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque Derecho: Monto Neto Recibido y Botones de Acción */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="font-body font-bold text-primary text-sm md:text-lg text-emerald-700 whitespace-nowrap">
                    +{formatPrecio(pago.montoNetoPago)}
                  </div>
                  {pago.aplicaComisionPago && (
                    <div className="text-[10px] text-gray-400 font-medium">
                      Neto recibido
                    </div>
                  )}
                </div>

                {/* 🌟 ACCIONES DE FILA: Editar y Eliminar Abono */}
                <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                  {/* Editar Abono */}
                  {onEditPago && (
                    <button
                      type="button"
                      onClick={() => onEditPago(pago)}
                      className="p-1.5 text-primary hover:bg-gray-100 rounded-md transition-colors cursor-pointer hidden"
                      title="Editar concepto o fecha del abono"
                    >
                      <Pencil className="w-3.5 h-3.5 md:w-4 h-4 text-primary" />
                    </button>
                  )}

                  {/* 🎯 Eliminar Abono: Validado en caliente por rol/columna desde Zustand */}
                  {puedeBorrar && onDeletePago && (
                    <button
                      type="button"
                      onClick={() => onDeletePago(pago.id)} // 🚀 Mandamos el id real rescatado de SQL
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer animate-fadeIn"
                      title="Eliminar abono de caja permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="border-t-2 border-dashed border-neutral/20 w-full" />

      {/* Fila del Total */}
      <div className="w-full flex items-center justify-between px-2">
        <span className="font-headline text-sm font-bold text-neutral/80 tracking-wide">
          TOTAL EN CUENTA
        </span>
        <span className="font-body font-black text-primary text-lg md:text-xl">
          {formatPrecio(totalPagado)}
        </span>
      </div>
    </div>
  );
};
