import React from "react";
import { Award } from "lucide-react";
import { type TopCliente } from "../../domain/cortes.repository";

interface Props {
  clientes: TopCliente[];
}

export const CardTopClientes: React.FC<Props> = ({ clientes }) => {
  // Función para obtener iniciales del cliente para el avatar alternativo
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral/5">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-body text-neutral text-lg">Clientes Destacados</h3>
        <Award size={18} className="text-secondary animate-pulse" />
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {clientes.map((c, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-tertiary transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              {/* Avatar Minimalista */}
              <div className="w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {getInitials(c.cliente)}
              </div>

              <div>
                <span className="font-body font-semibold text-neutral text-sm block">
                  {c.cliente}
                </span>
                <span className="text-xs text-surface/60 font-body block truncate max-w-[180px] hidden">
                  {c.correo || "Sin correo registrado"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline font-bold text-primary text-sm block">
                ${c.totalDineroGastado.toLocaleString("es-MX")}
              </span>
              <span className="text-[11px] text-surface/70 font-body block hidden">
                {c.cantidadViajes} viaje{c.cantidadViajes > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
