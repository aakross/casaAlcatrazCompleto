import React from "react";
import { TrendingUp } from "lucide-react";
import { type Finanzas } from "../../domain/cortes.repository";

interface Props {
  finanzas: Finanzas;
}

export const CardTotalBruto: React.FC<Props> = ({ finanzas }) => {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5 flex flex-col justify-between gap-4 w-full hidden">
      {/* Fila Superior: Título e Icono */}
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="font-body text-gray-500 font-semibold text-sm tracking-wide uppercase">
          Ingresos Totales
        </span>
        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Fila Central: Monto Dinámico Adaptable */}
      <div className="w-full min-w-0">
        <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl text-primary font-black truncate">
          {formatMoney(finanzas.totalBruto)}
        </h2>
      </div>

      {/* Fila Inferior: Nota aclaratoria */}
      <div className="w-full border-t border-gray-100 pt-3">
        <p className="text-gray-400 text-xs font-medium">
          *Ingresos brutos totales registrados en la plataforma.
        </p>
      </div>
    </div>
  );
};
