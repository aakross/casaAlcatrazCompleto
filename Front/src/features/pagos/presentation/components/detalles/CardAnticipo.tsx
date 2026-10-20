import { CheckCircle2 } from "lucide-react";

export const CardAnticipos = ({ recibido }: { recibido: number }) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-black/5 flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Pagos Recibidos
        </span>
        <span className="text-2xl md:text-3xl font-body font-black text-emerald-600">
          {formatPrecio(recibido)}
        </span>
      </div>
      <hr className="border-t border-gray-100 w-full" />
      <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 w-fit px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Montos abonados a caja</span>
      </div>
    </div>
  );
};
