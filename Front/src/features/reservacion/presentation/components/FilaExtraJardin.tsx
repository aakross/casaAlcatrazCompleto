import {type UseFormRegister,type FieldErrors } from "react-hook-form";
import { Trash2 } from "lucide-react";

interface FilaProps {
  index: number;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  eliminarExtra: (index: number) => void;
}

export const FilaExtraJardin = ({ index, register, errors, eliminarExtra }: FilaProps) => {
  const filaError = (errors.extras as any)?.[index];


  return (
    <div className="flex flex-col gap-2 p-2 rounded border bg-ohsunny/5 border-ohsunny/20 transition-all duration-200 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
        
        {/* Concepto Selector (Fijo en Jardin) */}
        <div className="flex-1 w-full min-w-[140px]">
          <select
            {...register(`extras.${index}.concepto` as const)}
            className="w-full border border-gray-300 rounded p-1 text-xs text-ohsunny font-bold bg-white focus:ring-0 outline-none"
          >
            <option value="Jardin">Jardin</option>
            <option value="Servicio de cocina">Servicio de cocina</option>
            <option value="Cocineros">Cocineros</option>
            <option value="Ayudantes">Ayudantes</option>
            <option value="Salida Tardia">Salida Tardia</option>
            <option value="Entrada Anticipada">Entrada Anticipada</option>
            <option value="Otros">Otros(especificar)</option>
          </select>
        </div>

        {/* Cantidad (Oculta para Jardín, siempre vale 1) */}
        <div className="w-full sm:w-[55px]">
          <div className="w-full border border-transparent rounded p-1 text-xs text-center text-gray-400 bg-gray-200/50 select-none font-bold">-</div>
          <input type="hidden" {...register(`extras.${index}.cantidad` as const, { valueAsNumber: true })} value={1} />
        </div>

        {/* Días */}
        <div className="w-full sm:w-[55px]">
          <input
            type="number"
            {...register(`extras.${index}.dias` as const)}
            placeholder="Días"
            className="w-full border border-gray-300 rounded p-1 text-xs text-center text-black bg-white focus:ring-0 outline-none"
          />
        </div>

        {/* Precio x Dia */}
        <div className="w-full sm:w-[85px]">
          <input
            type="number"
            {...register(`extras.${index}.precioUnitarioNoche` as const)}
            placeholder="Precio"
            className="w-full border border-gray-300 rounded p-1 text-xs text-right text-black bg-white focus:ring-0 outline-none"
          />
        </div>

        {/* Tipo de Evento */}
        <div className="w-full sm:w-[120px]">
          <input
            type="text"
            {...register(`extras.${index}.tipoEvento` as const)}
            placeholder="Ej. Boda..."
            className="w-full border border-gray-300 rounded p-1 text-xs text-black bg-white focus:ring-0 outline-none"
          />
        </div>

        {/* Invitados */}
        <div className="w-full sm:w-[65px]">
          <input
            type="number"
            {...register(`extras.${index}.invitadosEvento` as const, { valueAsNumber: true })}
            placeholder="0"
            className="w-full border border-gray-300 rounded p-1 text-xs text-center text-black bg-white font-semibold focus:ring-0 outline-none"
          />
        </div>

        {/* Comisión */}
        <div className="w-full sm:w-[45px]">
          <input
            type="number"
            {...register(`extras.${index}.porcentajeComision` as const, { valueAsNumber: true })}
            placeholder="-"
            className="w-full border border-gray-300 rounded p-1 text-xs text-center text-black bg-white font-semibold focus:ring-0 outline-none"
          />
        </div>

        {/* Eliminar */}
        <button type="button" onClick={() => eliminarExtra(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded cursor-pointer border border-red-100 shadow-xs mt-3 sm:mt-0 self-center">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Error Comisión */}
      {filaError?.comision && (
        <p className="text-red-500 text-[10px] px-1">{String(filaError.comision.message)}</p>
      )}
    </div>
  );
};
