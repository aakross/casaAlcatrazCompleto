import { AlertCircle } from "lucide-react";

export const CardBalancePendiente = ({ pendiente }: { pendiente: number }) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-black/5 flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <span className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
          Saldo Pendiente
        </span>
        <span className="text-2xl md:text-3xl font-body font-black text-amber-600">
          {formatPrecio(pendiente)}
        </span>
      </div>
      <hr className="border-t border-gray-100 w-full" />
      <div className="flex items-center gap-2 text-xs text-amber-700 font-medium bg-amber-50 w-fit px-2.5 py-1 rounded-full">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Monto restante para liquidar*</span>
      </div>
    </div>
  );
};
