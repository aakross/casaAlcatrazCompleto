import { Info } from "lucide-react";

export const CardGarantia = ({ total }: { total: number }) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-blue-100/50 flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-blue-600 uppercase">
          Depósito de Garantía
        </span>
        <span className="text-2xl md:text-3xl font-body font-black text-blue-700">
          {formatPrecio(total)}
        </span>
      </div>
      <hr className="border-t border-blue-100/50 w-full" />
      <div className="flex items-center gap-2 text-xs text-blue-500/80 font-medium">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span>Monto reembolsable • Excluido del balance</span>
      </div>
    </div>
  );
};
