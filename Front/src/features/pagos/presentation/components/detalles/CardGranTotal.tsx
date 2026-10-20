import { Info } from "lucide-react";

export const CardGranTotal = ({ total }: { total: number }) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-primary/10 flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
          Gran Total Estancia
        </span>
        <span className="text-2xl md:text-3xl font-body font-black text-primary">
          {formatPrecio(total)}
        </span>
      </div>
      <hr className="border-t border-primary/10 w-full" />
      <div className="flex items-center gap-2 text-xs text-primary/70 font-medium">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>Consolidado global (Hospedaje + Extras - Comisiones)</span>
      </div>
    </div>
  );
};
