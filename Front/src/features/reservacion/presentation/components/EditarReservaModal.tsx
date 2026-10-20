import { useEffect } from "react";
import {
  Calendar,
  Users,
  Banknote,
  X,
  Phone,
  User,
  Percent,
  Globe,
} from "lucide-react"; // Iconos de Lucide
import { DateRangePicker } from "./DateRangePicker";
import type { DateRange } from "react-day-picker";
import { parseISO } from "date-fns";
import { FilaExtraEstandar } from "./FilaExtraEstandar";
import { FilaExtraJardin } from "./FilaExtraJardin";
// import { type ReservaFormData } from "../../domain/reserva.schema";

interface EditarReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: any;
  handleSubmit: any;
  errors: any;
  isSubmitting: boolean;
  watch: any;
  control: any;
  setValue: any;
  origenes: Array<{ id: number; nombre: string }>;
  extrasFields: any[];
  agregarExtra: () => void;
  agregarJardin: () => void;
  eliminarExtra: (index: number) => void;
  isLoadingDatos?: boolean;
}

export const EditarReservaModal = ({
  isOpen,
  onClose,
  register,
  handleSubmit,
  errors,
  isSubmitting,
  watch,
  setValue,
  origenes,
  extrasFields,
  agregarExtra,
  eliminarExtra,
  isLoadingDatos,
}: EditarReservaModalProps) => {
  // Observamos los cambios en caliente para calcular el hospedaje base
  const diasHospedaje = watch("diasHospedaje") || 0;
  const precioNoche = watch("precioNoche") || 0;
  const totalHospedajeBase = diasHospedaje * precioNoche;
  const fechaEntradaRaw = watch("fechaEntrada");
  const fechaSalidaRaw = watch("fechaSalida");

  const todosLosExtras = watch("extras");

  useEffect(() => {
    if (todosLosExtras && todosLosExtras.length > 0) {
    }
  }, [todosLosExtras]);

  // Sincronizamos el total calculado automáticamente con React Hook Form
  useEffect(() => {
    if (isOpen) {
      setValue("montoTotal", totalHospedajeBase);
    }
  }, [totalHospedajeBase, setValue, isOpen]);

  let rangoInicial: DateRange | undefined = undefined;
  if (fechaEntradaRaw && fechaSalidaRaw) {
    rangoInicial = {
      from:
        typeof fechaEntradaRaw === "string"
          ? parseISO(fechaEntradaRaw)
          : fechaEntradaRaw,
      to:
        typeof fechaSalidaRaw === "string"
          ? parseISO(fechaSalidaRaw)
          : fechaSalidaRaw,
    };
  }

  const listaExtras = watch("extras") || [];
  const subtotalExtras = listaExtras.reduce(
    (acc: number, current: any, index: number) => {
      if (!current) return acc;
      const cantidad = Number(current.cantidad) || 0;
      const dias = Number(current.dias) || 0;
      const precio = Number(current.precioUnitarioNoche) || 0;
      const montoCalculadoExtra = cantidad * dias * precio;

      if (current.monto !== montoCalculadoExtra) {
        setValue(`extras.${index}.monto`, montoCalculadoExtra);
      }
      return acc + montoCalculadoExtra;
    },
    0,
  );

  const granMontoTotalCalculado = totalHospedajeBase + subtotalExtras;
  console.log(granMontoTotalCalculado);

  const handleModalDateChange = (range: any) => {
    if (range?.from) {
      setValue("fechaEntrada", range.from.toISOString().split("T")[0], {
        shouldValidate: true,
      });
      if (range.to) {
        setValue("fechaSalida", range.to.toISOString().split("T")[0], {
          shouldValidate: true,
        });
        const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setValue("diasHospedaje", diffDays, { shouldValidate: true });
      } else {
        setValue("fechaSalida", "");
        setValue("diasHospedaje", 0);
      }
    } else {
      setValue("fechaEntrada", "");
      setValue("fechaSalida", "");
      setValue("diasHospedaje", 0);
    }
  };

  if (!isOpen) return null;

  if (isLoadingDatos) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-xl border-l-5 border-primary font-body font-medium text-gray-500 animate-pulse">
          ⏳ Cargando detalles de la reservación...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      {/* Contenedor del Modal */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border-l-5 border-primary overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-primary text-xl font-bold">
              Editar Detalles de la Reservación
            </h2>
            <p className="text-xs text-gray-500 font-body mt-0.5">
              Modifique los datos del huésped o los parámetros de la estancia
              base.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2 font-body text-primary font-bold text-sm border-b border-gray-100 pb-1 mt-1">
            👤 Información del Cliente
          </div>

          {/* Nombre */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Nombre del Huésped
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.nombreHuesped ? "border-red-500" : "border-primary"}`}
            >
              <User color="#d4af37" className="w-4 h-4" />
              <input
                type="text"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                placeholder="Ej. Carlos"
                {...register("nombreHuesped")}
              />
            </div>
            {errors.nombreHuesped && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {String(errors.nombreHuesped.message)}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Apellido del Huésped
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.apellidoHuesped ? "border-red-500" : "border-primary"}`}
            >
              <User color="#d4af37" className="w-4 h-4" />
              <input
                type="text"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                placeholder="Ej. Mendoza"
                {...register("apellidoHuesped")}
              />
            </div>
            {errors.apellidoHuesped && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {String(errors.apellidoHuesped.message)}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Teléfono de Contacto
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.telefono ? "border-red-500" : "border-primary"}`}
            >
              <Phone color="#d4af37" className="w-4 h-4" />
              <input
                type="tel"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                placeholder="Ej. 9511234567"
                {...register("telefono", {
                  setValueAs: (v: string) => String(v),
                })}
              />
            </div>
            {errors.telefono && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {String(errors.telefono.message)}
              </p>
            )}
          </div>

          {/* Número de Huéspedes */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Total de Huéspedes
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.huespedes ? "border-red-500" : "border-primary"}`}
            >
              <Users color="#d4af37" className="w-4 h-4" />
              <input
                type="number"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                placeholder="1"
                {...register("huespedes", { valueAsNumber: true })}
              />
            </div>
            {errors.huespedes && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {String(errors.huespedes.message)}
              </p>
            )}
          </div>

          {/* ================= SECCIÓN: PARÁMETROS DE ESTANCIA ================= */}
          <div className="sm:col-span-2 font-body text-primary font-bold text-sm border-b border-gray-100 pb-1 mt-3">
            🏠 Valores de la Estancia y Finanzas
          </div>

          <div className="sm:col-span-2">
            <div className="font-body font-medium mb-1 text-xs">
              Modificar Fechas de Estancia
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.fechaEntrada || errors.fechaSalida ? "border-red-500" : "border-primary"}`}
            >
              <DateRangePicker
                onRangeChange={handleModalDateChange}
                initialRange={rangoInicial}
                esEdicion={true}
              />
            </div>
          </div>
          {/* Noches (Read Only) */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Noches de Estancia (Fijas)
            </div>
            <div className="border rounded-md p-2 flex items-center gap-2 bg-gray-50 border-primary">
              <Calendar className="w-4 h-4 text-secondary" />
              <input
                type="number"
                readOnly
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral-500 cursor-not-allowed outline-none font-semibold w-full"
                {...register("diasHospedaje", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Origen / Plataforma
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.origenReserva ? "border-red-500" : "border-primary"}`}
            >
              <Globe color="#d4af37" className="w-4 h-4" />
              <select
                {...register("origenReserva")}
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral outline-none cursor-pointer w-full text-black"
              >
                {origenes.map((origen) => (
                  <option key={origen.id} value={String(origen.id)}>
                    {origen.nombre}
                  </option>
                ))}
                {/* <option value="OTRO">+ Otro (Especificar)</option> */}
              </select>
            </div>
          </div>

          {/* Precio por Noche */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Precio por Noche (MXN)
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.precioNoche ? "border-red-500" : "border-primary"}`}
            >
              <Banknote color="#d4af37" className="w-4 h-4" />
              <input
                type="number"
                step="0.01"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                placeholder="0.00"
                {...register("precioNoche", { valueAsNumber: true })}
              />
            </div>
            {errors.precioNoche && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {String(errors.precioNoche.message)}
              </p>
            )}
          </div>

          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Porcentaje de Comisión (%)
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.porcentajeComision ? "border-red-500" : "border-primary"}`}
            >
              <Percent color="#d4af37" className="w-4 h-4" />
              <input
                type="number"
                step="0.01"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                {...register("porcentajeComision", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Depósito de Garantía */}
          <div>
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Depósito de Garantía (MXN)
            </div>
            <div
              className={`border rounded-md p-2 flex items-center gap-2 bg-white ${errors.montoGarantia ? "border-red-500" : "border-primary"}`}
            >
              <Banknote color="#d4af37" className="w-4 h-4" />
              <input
                type="number"
                step="0.01"
                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral w-full outline-none"
                placeholder="0.00"
                {...register("montoGarantia", { valueAsNumber: true })}
              />
            </div>
            {errors.montoGarantia && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {String(errors.montoGarantia.message)}
              </p>
            )}
          </div>

          {/* Monto Total Calculado Inmuble */}
          <div className="hidden">
            <div className="font-body text-surface font-medium mb-1 text-xs">
              Subtotal Hospedaje (Auto)
            </div>
            <div className="border border-primary rounded-md p-2 bg-gray-50 flex items-center gap-2 select-none cursor-not-allowed">
              <Banknote color="#d4af37" className="w-4 h-4 opacity-60" />
              <span className="flex-1 text-sm text-neutral-500 font-semibold">
                ${Number(totalHospedajeBase || 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="sm:col-span-2 border-t border-gray-200 pt-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="font-body text-primary font-bold text-sm">
                ✨ Servicios Extras Acumulados
              </div>
              <button
                type="button"
                onClick={agregarExtra}
                className="bg-primary text-white text-[11px] font-semibold px-2 py-1 rounded hover:bg-opacity-90 transition-all cursor-pointer"
              >
                + Modificar/Añadir Extra
              </button>
            </div>

            {extrasFields.length === 0 && (
              <p className="text-gray-400 text-[11px] italic bg-gray-50 p-2 rounded text-center border border-dashed border-gray-200">
                Esta reservación no posee servicios adicionales actualmente.
              </p>
            )}

            {/* Cabeceras Alineadas */}
            {extrasFields.length > 0 && (
              <div className="hidden sm:flex gap-2 px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none border-b border-black/5 pb-1">
                <div className="flex-1 min-w-[140px]">
                  Concepto del Servicio
                </div>
                <div className="w-[55px] text-center">Cant.</div>
                <div className="w-[55px] text-center">Días</div>
                <div className="w-[85px] text-right pr-2">Precio x Día</div>
                <div className="w-[120px] text-left pl-1">Tipo de Evento</div>
                <div className="w-[65px] text-center">Invitados</div>
                <div className="w-[45px] text-center">Comis.</div>
                <div className="w-[35px]"></div>
              </div>
            )}

            {/* Mapeo modular */}
            <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
              {extrasFields.map((field, index) => {
                const conceptoActual = watch(`extras.${index}.concepto`);
                const esFilaJardin = conceptoActual === "Jardin";

                const opcionesFijas = [
                  "Servicio de cocina",
                  "Cocineros",
                  "Jardin",
                  "Ayudantes",
                  "Salida Tardia",
                  "Entrada Anticipada",
                ];
                const esConceptoPersonalizadoBD =
                  conceptoActual &&
                  !opcionesFijas.includes(conceptoActual) &&
                  conceptoActual !== "Otros" &&
                  conceptoActual !== "Otros(especificar)";

                if (esFilaJardin) {
                  return (
                    <FilaExtraJardin
                      key={field.id}
                      index={index}
                      register={register}
                      errors={errors}
                      eliminarExtra={eliminarExtra}
                    />
                  );
                }

                return (
                  <FilaExtraEstandar
                    key={field.id}
                    index={index}
                    register={register}
                    errors={errors}
                    watch={watch}
                    eliminarExtra={eliminarExtra}
                    esConceptoPersonalizadoBD={esConceptoPersonalizadoBD}
                  />
                );
              })}
            </div>
          </div>

          {/* Botones de Cierre y Envío */}
          <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 font-headline text-white font-bold rounded-lg text-sm shadow-sm transition-all text-center cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-opacity-90 active:scale-98"
              }`}
            >
              {isSubmitting ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>

          {/* Botones de Cierre y Envío */}
          <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2 flex justify-end gap-3 hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 font-headline text-white font-bold rounded-lg text-sm shadow-sm transition-all text-center cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-opacity-90 active:scale-98"
              }`}
            >
              {isSubmitting ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
