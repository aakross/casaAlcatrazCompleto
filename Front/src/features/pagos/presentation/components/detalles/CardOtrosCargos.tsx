import { Receipt } from "lucide-react";

interface CardOtrosCargosProps {
  total: number;
  conceptos?: string[];
}

export const CardOtrosCargos = ({ total, conceptos = [] }: CardOtrosCargosProps) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-amber-200/60 flex flex-col gap-4 font-body">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
            Otros Gastos / Cargos Deducidos
          </span>
          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md mt-0.5 self-start">
            Deducción Operativa
          </span>
        </div>
        <span className="text-2xl md:text-3xl font-body font-black text-amber-800">
          {formatPrecio(total)}
        </span>
      </div>
      <hr className="border-t border-amber-100 w-full" />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-amber-700/80 font-medium">
          <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Deducido del total estancia (publicidad, comisiones directas)</span>
        </div>
        {conceptos.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {conceptos.map((concepto, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-amber-100/70 text-amber-900 px-2 py-0.5 rounded-full font-medium"
              >
                {concepto}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
