import React from "react";
import { Calendar, Users, Clock, Moon } from "lucide-react";
import {
  type Historico,
  type EstadoReserva,
} from "../../domain/cortes.repository";

interface Props {
  historico: Historico;
  estados: EstadoReserva[];
}

export const CardResumenHistorico: React.FC<Props> = ({
  historico,
  estados,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5 flex flex-col justify-between w-full h-full">
      <div>
        <h3 className="font-body text-gray-500 font-semibold text-sm tracking-wide uppercase mb-4">
          Histórico y Operaciones
        </h3>

        {/* REJILLA DE MÉTRICAS ADAPTABLE: 2 columnas en móvil, 4 columnas a partir de sm: (tablets/desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Métricas 1: Total Reservas */}
          <div className="bg-tertiary p-3 rounded-xl flex flex-col justify-between min-h-[90px] border border-black/5">
            <Calendar size={16} className="text-primary opacity-80" />
            <div className="mt-2">
              <span className="block font-headline text-xl md:text-2xl font-black text-primary">
                {historico.totalReservasHistoricas}
              </span>
              <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">
                Reservas
              </span>
            </div>
          </div>

          {/* Métrica 2: Total Huéspedes */}
          <div className="bg-tertiary p-3 rounded-xl flex flex-col justify-between min-h-[90px] border border-black/5">
            <Users size={16} className="text-primary opacity-80" />
            <div className="mt-2">
              <span className="block font-headline text-xl md:text-2xl font-black text-primary">
                {historico.totalHuespedesRecibidos}
              </span>
              <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">
                Huéspedes
              </span>
            </div>
          </div>

          {/* NUEVA MÉTRICA EXTRAÍDA DEL API: Total Días/Noches Reservados */}
          <div className="bg-tertiary p-3 rounded-xl flex flex-col justify-between min-h-[90px] border border-black/5">
            <Moon size={16} className="text-primary opacity-80" />
            <div className="mt-2">
              <span className="block font-headline text-xl md:text-2xl font-black text-primary">
                {historico.totalDiasReservados}
              </span>
              <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">
                Noches Totales
              </span>
            </div>
          </div>

          {/* Métrica 4: Promedio de Estadía */}
          <div className="bg-tertiary p-3 rounded-xl flex flex-col justify-between min-h-[90px] border border-black/5">
            <Clock size={16} className="text-primary opacity-80" />
            <div className="mt-2">
              <span className="block font-headline text-xl md:text-2xl font-black text-primary">
                {historico.promedioDiasPorReserva}d
              </span>
              <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">
                Prom. Estadía
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior: Estados de las reservas actuales */}
      <div className="border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-3">
          Estatus de reservas actuales:
        </span>
        <div className="flex flex-wrap gap-2">
          {estados.map((e) => {
            const estadoLimpio = e.estado.toLowerCase().trim();
            const isFinalizado = estadoLimpio === "finalizado";
            const isPendiente = estadoLimpio === "pendiente";

            // Asignación de colores inteligente según el estatus
            let colorClasses = "bg-gray-100 text-gray-700"; // Fallback por defecto
            if (isFinalizado)
              colorClasses =
                "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
            if (isPendiente)
              colorClasses =
                "bg-amber-50 text-amber-700 border border-amber-200/50";

            return (
              <span
                key={e.estado}
                className={`text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs ${colorClasses}`}
              >
                <span>{e.estado.trim()}:</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded-md text-[11px] font-black min-w-[20px] text-center">
                  {e.cantidad}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
