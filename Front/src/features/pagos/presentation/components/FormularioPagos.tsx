import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import {
  // useFormularioPagos,
  type PagoFormValues,
} from "../hooks/useFormularioPagos";
import { DatePickerPago } from "./detalles/DatePickerPago";

interface RegistrarPagoFormProps {
  register: UseFormRegister<PagoFormValues>;
  errors: FieldErrors<PagoFormValues>;
  setValue: any;
  watch: UseFormWatch<PagoFormValues>;
  isSubmitting: boolean;
  aplicaComision: boolean;
  origenDineroId: number;
  seleccionarOrigenDinero: (id: number) => void;
  manejarSubmit: (e: React.FormEvent) => void;
}

export const RegistrarPagoForm = ({
  register,
  errors,
  isSubmitting,
  setValue,
  watch,
  aplicaComision,
  origenDineroId,
  seleccionarOrigenDinero,
  manejarSubmit,
}: RegistrarPagoFormProps) => {
  const handleDateChange = (dateStr: string) => {
    setValue("fechaDeposito", dateStr, { shouldValidate: true });
  };
  return (
    <div className="w-full font-body text-neutral">
      <h2 className="font-headline text-2xl text-primary mb-6 font-bold">
        Registrar Pago
      </h2>

      <form onSubmit={manejarSubmit} className="space-y-5" noValidate>
        {/* Campos Ocultos */}
        <input type="hidden" {...register("reservacionId")} />
        <input type="hidden" {...register("userCreate")} />

        {/* Campo: Monto Bruto */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label text-sm font-medium text-surface">
            Monto Bruto (MXN)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("montoBruto", { valueAsNumber: true })}
              className={`w-full pl-7 pr-3 py-2 rounded-lg border bg-surfacecontainer outline-none transition-all
                ${errors.montoBruto ? "border-error focus:ring-1 focus:ring-error" : "border-gray-300 focus:border-secondary focus:ring-1 focus:ring-secondary"}`}
            />
          </div>
          {errors.montoBruto && (
            <p className="text-error text-xs font-medium">
              {errors.montoBruto.message}
            </p>
          )}
        </div>

        {/* Campo: Concepto de Pago */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label text-sm font-medium text-surface">
            Concepto de Pago
          </label>
          <select
            {...register("conceptoPagoId", { valueAsNumber: true })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-surfacecontainer outline-none transition-all focus:border-secondary focus:ring-1 focus:ring-secondary text-sm"
          >
            <option value={1}>Anticipo / Reserva</option>
            <option value={2}>Abono</option>
            <option value={3}>Liquidación</option>
            {/* <option value={4}>Depósito en Garantía</option> */}
          </select>
          {errors.conceptoPagoId && (
            <p className="text-error text-xs font-medium">
              {errors.conceptoPagoId.message}
            </p>
          )}
        </div>

        <div>
          <div className="font-body font-medium mb-1 text-sm">
            Fecha del Depósito
          </div>
          <div
            className={`border rounded-md p-2 flex items-center gap-2 bg-white ${
              errors.fechaDeposito ? "border-red-500" : "border-primary"
            }`}
          >
            <DatePickerPago
              onDateChange={handleDateChange}
              initialDate={watch("fechaDeposito")}
            />
          </div>
          {errors.fechaDeposito && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.fechaDeposito.message}
            </p>
          )}
        </div>

        {/* Campo: Origen de Dinero / Método de Pago (Botones Estilizados sin Lógica) */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label text-sm font-medium text-surface">
            Método de Pago
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => seleccionarOrigenDinero(1)} // ID 1 = Efectivo
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all font-medium cursor-pointer
                ${
                  origenDineroId === 1
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surfacecontainer text-surface border-gray-300 hover:border-secondary"
                }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Efectivo
            </button>

            <button
              type="button"
              onClick={() => seleccionarOrigenDinero(2)} // ID 2 = Transferencia
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all font-medium cursor-pointer
                ${
                  origenDineroId === 2
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surfacecontainer text-surface border-gray-300 hover:border-secondary"
                }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Transferencia
            </button>
          </div>
          {errors.origenDineroId && (
            <p className="text-error text-xs font-medium">
              {errors.origenDineroId.message}
            </p>
          )}
        </div>

        {/* Campo: Aplica Comisión */}
        <div className="flex items-center gap-3 bg-surfacecontainer/50 p-3 rounded-lg border border-gray-200 hidden">
          <input
            type="checkbox"
            id="aplicaComision"
            {...register("aplicaComision")}
            className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary accent-primary cursor-pointer"
          />
          <label
            htmlFor="aplicaComision"
            className="font-label text-sm font-medium text-surface cursor-pointer select-none"
          >
            ¿Este pago aplica comisión bancaria u operativa?
          </label>
        </div>

        {/* Campo Condicional: Monto Comisión */}
        {aplicaComision && (
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-sm font-medium text-surface">
              Monto de la Comisión (MXN)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("montoComision", { valueAsNumber: true })}
                className={`w-full pl-7 pr-3 py-2 rounded-lg border bg-surfacecontainer outline-none transition-all
                  ${errors.montoComision ? "border-error focus:ring-1 focus:ring-error" : "border-gray-300 focus:border-secondary focus:ring-1 focus:ring-secondary"}`}
              />
            </div>
            {errors.montoComision && (
              <p className="text-error text-xs font-medium">
                {errors.montoComision.message}
              </p>
            )}
          </div>
        )}

        {/* Botón de Confirmación */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 bg-secondary text-primary font-bold py-3 px-4 rounded-lg shadow-md hover:brightness-110 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Procesando..." : "Confirmar Pago"}
        </button>
      </form>
    </div>
  );
};
