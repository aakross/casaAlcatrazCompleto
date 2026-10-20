import React from "react";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { type PlataformaInfo } from "../../domain/cortes.repository";

interface Props {
  plataformas: PlataformaInfo[];
}

export const CardVolumenCanales: React.FC<Props> = ({ plataformas }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5 flex flex-col justify-between w-full h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-primary w-4 h-4 shrink-0" />
          <h3 className="font-body text-gray-500 font-semibold text-sm tracking-wide uppercase">
            Volumen de Canales de Venta
          </h3>
        </div>

        {/* Rejilla de Canales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plataformas.map((p) => {
            const nombreLimpio = p.plataforma.trim();
            return (
              <div
                key={nombreLimpio}
                className="bg-tertiary border border-black/5 p-4 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {nombreLimpio}
                  </span>
                  <span className="block text-2xl font-black text-primary mt-1">
                    {p.cantidadReservaciones}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                    Reservaciones
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg text-primary shadow-xs border border-gray-100 shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
