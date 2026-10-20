import React from 'react';
import {type ExtraEliminado } from '../hooks/useBitacoraBorrados'; 

interface Props {
  extras: ExtraEliminado[];
}

export const ExtrasDesglose: React.FC<Props> = ({ extras }) => {
  if (!extras || extras.length === 0) return <span className="text-gray-400 italic">Sin extras</span>;

  return (
    <div className="mt-2 space-y-1 bg-surfacecontainer/60 p-3 rounded-md border border-neutral/10 text-xs">
      <div className="font-semibold text-primary mb-1 border-b border-neutral/10 pb-0.5">
        ✨ Servicios Extras Eliminados:
      </div>
      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
        {extras.map((ex) => (
          <div key={ex.id} className="flex justify-between items-start text-neutral">
            <div>
              <span className="font-medium text-primary-dark">{ex.concepto}</span>
              <span className="text-gray-500 ml-1">
                ({ex.cantidad}pz × {ex.dias}días)
              </span>
            </div>
            <span className="font-semibold text-surface">
              ${Number(ex.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
