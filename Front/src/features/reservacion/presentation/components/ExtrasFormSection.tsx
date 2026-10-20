import React from 'react';

interface ExtrasProps {
  register: any;
  watch: any;
  errors: any;
  agregarExtra: () => void;
  eliminarExtra: (index: number) => void;
  extrasFields: any[];
  setValue: any; // 🆕 Inyectamos el setValue para controlar los valores de forma limpia
}

export const ExtrasFormSection: React.FC<ExtrasProps> = ({
  register,
  watch,
  errors,
  agregarExtra,
  eliminarExtra,
  extrasFields,
  setValue, // 🆕
}) => {
  return (
    <div className="mt-3 border-t border-gray-200 pt-4 md:mx-4 col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="font-body text-surface font-semibold text-sm md:text-base">
          Costos Extras Adicionales (Eventos / Servicios)
        </div>
        <button
          type="button"
          onClick={agregarExtra}
          className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-all shadow-sm"
        >
          + Agregar Extra
        </button>
      </div>

      {extrasFields.length === 0 && (
        <p className="text-gray-400 text-xs italic bg-gray-50 p-3 rounded-md border border-dashed border-gray-200 text-center">
          No se han registrado costos adicionales a esta reservación.
        </p>
      )}

      <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
        {extrasFields.map((field, index) => {
          const filaError = errors.extras?.[index];
          const tipoConcepto = watch(`extras.${index}.conceptoTipo`);

          return (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-3 items-start bg-gray-50 p-3 rounded-md border border-gray-200 relative animate-fadeIn"
            >
              {/* 1. Selector del tipo de concepto */}
              <div className="flex-1 w-full grid grid-cols-1 gap-2">
                <div className="text-[11px] text-gray-500 font-medium mb-0.5">
                  Concepto del Extra
                </div>

                <div
                  className={`border rounded-md p-2 bg-white flex items-center ${filaError?.concepto ? "border-red-500" : "border-gray-300 focus-within:border-primary"}`}
                >
                  <select
                    {...register(`extras.${index}.conceptoTipo` as const)}
                    onChange={(e) => {
                      const valorSeleccionado = e.target.value;
                      // Actualizamos el conceptoTipo nativamente
                      setValue(`extras.${index}.conceptoTipo`, valorSeleccionado);
                      
                      // 🌟 EL TRUCO: Inyectamos el concepto string limpio sin usar inputs ocultos
                      if (valorSeleccionado === "Jardin") {
                        setValue(`extras.${index}.concepto`, "Jardín");
                      } else if (valorSeleccionado === "Cocineras" || valorSeleccionado === "Meseros") {
                        setValue(`extras.${index}.concepto`, valorSeleccionado);
                      } else {
                        setValue(`extras.${index}.concepto`, ""); // Limpiamos si elige "Otro"
                      }
                    }}
                    className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full"
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Cocineras">Cocineras</option>
                    <option value="Meseros">Meseros</option>
                    <option value="Jardin">Jardín (Aplica Comisión)</option>
                    <option value="Otro">Otro (Especificar)</option>
                  </select>
                </div>

                {/* Sub-input numérico si es Jardin (Fijo en el DOM, sin alterar referencias) */}
                {tipoConcepto === "Jardin" && (
                  <div className="animate-fadeIn">
                    <div className="text-[10px] text-gray-400 font-medium mb-0.5">
                      Porcentaje Comisión (%)
                    </div>
                    <div className="border rounded-md p-2 bg-white flex items-center border-gray-300 focus-within:border-primary">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Ej. 12"
                        {...register(`extras.${index}.porcentajeComision`, { valueAsNumber: true })}
                        className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Input de texto libre si es Otro (Se guarda directamente en concepto) */}
                {tipoConcepto === "Otro" && (
                  <div className="border rounded-md p-2 bg-white flex items-center border-gray-300 focus-within:border-primary animate-fadeIn">
                    <input
                      type="text"
                      {...register(`extras.${index}.concepto`)}
                      placeholder="Ej. Brincolines"
                      className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full"
                    />
                  </div>
                )}

                {filaError?.concepto && (
                  <p className="text-red-500 text-[11px] mt-0.5 font-medium">
                    {filaError.concepto.message}
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div className="w-full sm:w-[70px]">
                <div className="text-[11px] text-gray-500 font-medium mb-0.5">Cant.</div>
                <div className="border rounded-md p-2 bg-white focus-within:border-primary">
                  <input
                    type="number"
                    min="1"
                    {...register(`extras.${index}.cantidad`, { valueAsNumber: true, required: true })}
                    className="w-full text-center text-sm p-0 border-none outline-none text-black bg-transparent focus:ring-0"
                  />
                </div>
              </div>

              {/* Días */}
              <div className="w-full sm:w-[70px]">
                <div className="text-[11px] text-gray-500 font-medium mb-0.5">Días</div>
                <div className="border rounded-md p-2 bg-white focus-within:border-primary">
                  <input
                    type="number"
                    min="1"
                    {...register(`extras.${index}.dias`, { valueAsNumber: true, required: true })}
                    className="w-full text-center text-sm p-0 border-none outline-none text-black bg-transparent focus:ring-0"
                  />
                </div>
              </div>

              {/* Precio Unitario */}
              <div className="w-full sm:w-[110px]">
                <div className="text-[11px] text-gray-500 font-medium mb-0.5">Precio ($)</div>
                <div className="border rounded-md p-2 bg-white focus-within:border-primary">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`extras.${index}.precioUnitarioNoche`, { valueAsNumber: true, required: true })}
                    className="w-full text-right text-sm p-0 border-none outline-none text-black bg-transparent focus:ring-0"
                  />
                </div>
              </div>

              {/* Botón Eliminar */}
              <button
                type="button"
                onClick={() => eliminarExtra(index)}
                className="text-red-500 p-1.5 mt-5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md transition-all"
              >
                <svg
                  xmlns="http://w3.org"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
