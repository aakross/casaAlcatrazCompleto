import {
  type UseFormRegister,
  type FieldErrors,
  type UseFormWatch,
} from "react-hook-form";
import { Trash2 } from "lucide-react";

interface FilaProps {
  index: number;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  eliminarExtra: (index: number) => void;
  esConceptoPersonalizadoBD: boolean;
}

export const FilaExtraEstandar = ({
  index,
  register,
  errors,
  watch,
  eliminarExtra,
  esConceptoPersonalizadoBD,
}: FilaProps) => {
  const conceptoActual = watch(`extras.${index}.concepto`);
  const mostrarInputOtros =
    conceptoActual === "Otros" || esConceptoPersonalizadoBD;
  const filaError = (errors.extras as any)?.[index];

  return (
    <div className="flex flex-col gap-2 p-2 rounded border bg-gray-50 border-gray-200 transition-all duration-200 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
        {/* Concepto */}
        <div className="flex-1 w-full min-w-[140px]">
          <select
            {...register(`extras.${index}.concepto` as const)}
            className="w-full border border-gray-300 rounded p-1 text-xs text-black bg-white focus:ring-0 outline-none"
          >
            <option value="" disabled>
              Selecciona un concepto
            </option>
            {esConceptoPersonalizadoBD && (
              <option value={conceptoActual}>{conceptoActual}</option>
            )}
            <option value="Servicio de cocina">Servicio de cocina</option>
            <option value="Cocineros">Cocineros</option>
            <option value="Ayudantes">Ayudantes</option>
            <option value="Jardin">Jardin</option>
            <option value="Salida Tardia">Salida Tardia</option>
            <option value="Entrada Anticipada">Entrada Anticipada</option>
            <option value="Otros">Otros(especificar)</option>
          </select>
          {filaError?.concepto && (
            <p className="text-red-500 text-[10px] mt-0.5">
              {String(filaError.concepto.message)}
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div className="w-full sm:w-[55px]">
          <input
            type="number"
            {...register(`extras.${index}.cantidad` as const, {
              valueAsNumber: true,
            })}
            placeholder="Cant"
            className="w-full border border-gray-300 rounded p-1 text-xs text-center text-black bg-white focus:ring-0 outline-none"
          />
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

        {/* Precio */}
        <div className="w-full sm:w-[85px]">
          <input
            type="number"
            {...register(`extras.${index}.precioUnitarioNoche` as const)}
            placeholder="Precio"
            className="w-full border border-gray-300 rounded p-1 text-xs text-right text-black bg-white focus:ring-0 outline-none"
          />
        </div>

        {/* Tipo de Evento (Bloqueado) */}
        <div className="w-full sm:w-[120px]">
          <div className="w-full border border-transparent rounded p-1 text-xs text-center text-gray-400 bg-gray-200/50 select-none pointer-events-none">
            -
          </div>
        </div>

        {/* Invitados (Bloqueado) */}
        <div className="w-full sm:w-[65px]">
          <div className="w-full border border-transparent rounded p-1 text-xs text-center text-gray-400 bg-gray-200/50 select-none pointer-events-none">
            -
          </div>
        </div>

        {/* Comisión (Bloqueado) */}
        <div className="w-full sm:w-[45px]">
          <div className="w-full border border-transparent rounded p-1 text-xs text-center text-gray-400 bg-gray-200/50 select-none pointer-events-none">
            -
          </div>
        </div>

        {/* Eliminar */}
        <button
          type="button"
          onClick={() => eliminarExtra(index)}
          className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded cursor-pointer border border-red-100 shadow-xs mt-3 sm:mt-0 self-center"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Caso Especial: Campo manual "Otros" */}
      {mostrarInputOtros && (
        <div className="w-full pt-1.5 border-t border-dashed border-gray-200 flex flex-col gap-0.5">
          <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
            Escribe el concepto personalizado
          </div>
          <input
            type="text"
            {...register(`extras.${index}.otroConcepto` as const)}
            placeholder="Ej. Decoración temática"
            className="w-full sm:max-w-md border border-gray-300 rounded p-1 text-xs text-black bg-white focus:ring-0 outline-none"
          />
          {filaError?.otroConcepto && (
            <p className="text-red-500 text-[10px] mt-0.5">
              {String(filaError.otroConcepto.message)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
