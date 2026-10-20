import { Info } from "lucide-react";

export const CardCostoTotal = ({ total }: { total: number }) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-black/5 flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Costo Total de la Reservación
        </span>
        <span className="text-2xl md:text-3xl font-body font-black text-primary">
          {formatPrecio(total)}
        </span>
      </div>
      <hr className="border-t border-gray-100 w-full" />
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Info className="w-4 h-4 text-gray-400 shrink-0" />
        <span>No incluye los extras</span>
      </div>
    </div>
  );
};
