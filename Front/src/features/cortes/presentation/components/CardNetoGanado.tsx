import React from "react";
import { DollarSign } from "lucide-react";
import { type Finanzas } from "../../domain/cortes.repository";

interface Props {
  finanzas: Finanzas;
}

export const CardNetoGanado: React.FC<Props> = ({ finanzas }) => {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);

  return (
    <div className="bg-emerald-600 rounded-xl p-5 shadow-sm border border-emerald-700 flex flex-col justify-between gap-4 w-full h-full text-white">
      {/* Fila Superior */}
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="font-body text-emerald-100 font-semibold text-sm tracking-wide uppercase">
          Ganancia Neta (Real)
        </span>
        <div className="bg-white/20 p-2 rounded-xl text-white shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* Fila Central */}
      <div className="w-full min-w-0">
        <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black truncate">
          {formatMoney(finanzas.totalNetoGanado)}
        </h2>
      </div>

      {/* Fila Inferior */}
      <div className="w-full border-t border-white/10 pt-3">
        <p className="text-emerald-100 text-xs font-medium">
          Monto neto.
        </p>
      </div>
    </div>
  );
};
