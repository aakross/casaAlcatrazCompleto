import React from "react";
import { type Finanzas } from "../../domain/cortes.repository";
import { Percent } from "lucide-react";

interface Props {
  finanzas: Finanzas;
}

export const CardMontosComisiones: React.FC<Props> = ({ finanzas }) => {
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5 border-l-4 border-l-red-500 flex flex-col justify-between gap-4 w-full h-full">
      {/* Fila Superior: Título e Icono */}
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="font-body text-gray-500 font-semibold text-sm tracking-wide uppercase">
          Monto en comisiones
        </span>
        <div className="bg-red-50 p-2 rounded-xl text-red-500 shrink-0">
          <Percent className="w-4 h-4" />
        </div>
      </div>

      {/* Fila Central: Monto Dinámico Adaptable */}
      <div className="w-full min-w-0">
        <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl text-red-600 font-black truncate">
          {formatMoney(finanzas.totalComisiones)}
        </h2>
      </div>

      {/* Fila Inferior: Nota aclaratoria */}
      <div className="w-full border-t border-gray-100 pt-3">
        <p className="text-gray-400 text-xs font-medium">
          *Tarifas de plataforma y terceros.
        </p>
      </div>
    </div>
  );
};
