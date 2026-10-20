import {
  User,
  House,
  Banknote,
  Check,
  ClockFadingIcon,
  Users,
  Phone,
} from "lucide-react";
import { DateRangePicker } from "../components/DateRangePicker";
import { useReservasForm } from "../hooks/useReservasForm";
import { UltimasCapturas } from "./UltimasCapturas";
import { useUltimasCapturas } from "../hooks/useUltimasCapturas";
import { useEditarReserva } from "../hooks/useEditarReserva";
import { EditarReservaModal } from "../components/EditarReservaModal";
import { useEffect } from "react";
import { ConfirmarEliminarModal } from "../components/ConfirmarEliminarModal";
import { useAuthStore } from "../../../../core/store/authStore";

export const ReservasPage = () => {
  const { reservas, isLoading, refrescarCapturas, deleteModal } =
    useUltimasCapturas();
  const modalEdicion = useEditarReserva(refrescarCapturas);
  const puedeBorrar = useAuthStore((state) => state.puedeBorrar) ?? false;
  const {
    register,
    handleSubmit,
    onSubmit,
    handleDateChange,
    handleClear,
    errors,
    origenes,
    esOrigenNuevo,
    extrasFields,
    agregarExtra,
    eliminarExtra,
    watch,
    agregarJardin,
  } = useReservasForm(refrescarCapturas);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
    }
  }, [errors]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-6 text-sm text-gray-500 font-medium">
        Cargando últimas capturas...
      </div>
    );
  }
  return (
    <div className="w-full min-h-full bg-tertiary flex flex-col md:grid md:grid-cols-2 gap-6 p-4 md:p-0">
      {/* Sección de Formulario */}
      <div className="w-full flex justify-center md:block">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full  bg-white p-4 md:p-6 rounded-lg border-l-5 border-secondary shadow-sm"
        >
          {/* TITULARES: Textos con tamaños adaptables para pantallas pequeñas */}
          <h1 className="font-headline text-primary text-2xl md:text-4xl font-bold">
            Datos del Huésped
          </h1>
          <h2 className="font-body text-neutral/70 mt-1 text-sm md:text-base">
            Ingrese los detalles para formalizar la estancia del cliente.
          </h2>

          {/* REJILLA DE INPUTS: 1 columna en mobile, 2 columnas desde pantallas md. Margen adaptado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-4 mx-0 md:m-4">
            {/* Sección de Huésped */}
            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Nombre del Huésped
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.nombreHuesped ? "border-red-500" : "border-primary"}`}
              >
                <User color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("nombreHuesped")}
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full"
                  placeholder="Ej. Alejandra"
                  type="text"
                />
              </div>
              {errors.nombreHuesped && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.nombreHuesped.message)}
                </p>
              )}
            </div>

            {/* Sección de apellido */}
            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Apellido del Huésped
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.apellidoHuesped ? "border-red-500" : "border-primary"}`}
              >
                <User color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("apellidoHuesped")}
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full"
                  placeholder="Ej. Valenzuela"
                  type="text"
                />
              </div>
              {errors.apellidoHuesped && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.apellidoHuesped.message)}
                </p>
              )}
            </div>
            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Teléfono
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.telefono ? "border-red-500" : "border-primary"}`}
              >
                <Phone color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("telefono", {
                    setValueAs: (v) => String(v), // 👈 ESTO ES LA MAGIA: Convierte cualquier entrada a string antes de ir a Zod
                  })}
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full"
                  placeholder="Ej. 55 1234 5678"
                  type="tel"
                />
              </div>
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.telefono.message)}
                </p>
              )}
            </div>

            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Huespedes
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.huespedes ? "border-red-500" : "border-primary"}`}
              >
                <Users color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("huespedes", { valueAsNumber: true })}
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full"
                  placeholder="Ej. 2 personas"
                  type="number"
                />
              </div>
              {errors.huespedes && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.huespedes.message)}
                </p>
              )}
            </div>

            {/* Sección de Reservación */}
            <div className="flex flex-col gap-4">
              {/* 1. SELECT DINÁMICO */}
              <div>
                <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                  Origen de Reservación
                </div>
                <div
                  className={`border rounded-md p-2 flex items-center gap-2 bg-white ${
                    errors.origenReserva ? "border-red-500" : "border-primary"
                  }`}
                >
                  <select
                    {...register("origenReserva")}
                    defaultValue=""
                    className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral outline-none cursor-pointer w-full text-black"
                  >
                    <option value="" disabled hidden>
                      Selecciona una plataforma
                    </option>

                    {/* Mapeamos los orígenes reales traídos de SQL Server por tu API */}
                    {origenes.map((origen) => (
                      <option
                        key={origen.id}
                        value={origen.id}
                        className="text-black bg-white"
                      >
                        {origen.nombre}
                      </option>
                    ))}

                    {/* Opción fija al final para activar el flujo alternativo */}
                    <option
                      value="OTRO"
                      className="text-primary font-semibold bg-white"
                    >
                      + Otro (Especificar)
                    </option>
                  </select>
                </div>
                {errors.origenReserva && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {String(errors.origenReserva.message)}
                  </p>
                )}
              </div>

              {/* 2. INPUT CONDICIONAL (Solo se dibuja si el usuario selecciona "+ Otro") */}
              {esOrigenNuevo && (
                <div className="transition-all duration-300 ease-in-out">
                  <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                    ¿Cuál es el nuevo origen?
                  </div>
                  <div
                    className={`border rounded-md p-2 flex items-center gap-2 bg-white ${
                      errors.nuevoOrigenNombre
                        ? "border-red-500"
                        : "border-primary"
                    }`}
                  >
                    <input
                      type="text"
                      {...register("nuevoOrigenNombre")}
                      placeholder="Ej. Airbnb, Booking, Expedia..."
                      className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-black outline-none w-full"
                    />
                  </div>
                  {errors.nuevoOrigenNombre && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {String(errors.nuevoOrigenNombre.message)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Porcentaje de Comisión
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.porcentajeComision ? "border-red-500" : "border-primary"}`}
              >
                {/* Input para el número */}
                <input
                  {...register("porcentajeComision", {
                    valueAsNumber: true, // 👈 Convierte la entrada vacía o numérica directamente a número/NaN para Zod
                  })}
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Ej. 10"
                  type="number"
                  step="0.01" // Permite decimales como 15.5 si fuera necesario
                  min="0"
                  max="100"
                />

                {/* Icono de porcentaje visualmente anclado al final */}
                <span className="text-secondary font-bold font-body text-sm md:text-base px-1 selection:bg-transparent">
                  %
                </span>
              </div>

              {errors.porcentajeComision && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.porcentajeComision.message)}
                </p>
              )}
            </div>

            {/* Sección de Monto Total */}
            <div className="hidden">
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Monto Total (MXN)
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.montoTotal ? "border-red-500" : "border-primary"}`}
              >
                <Banknote color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("montoTotal", { valueAsNumber: true })}
                  step="0.01"
                  disabled
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full"
                  placeholder="Ej. 1500"
                  type="number"
                />
              </div>
              {errors.montoTotal && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.montoTotal.message)}
                </p>
              )}
            </div>

            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Precio por Noche (MXN)
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 bg-white ${
                  errors.precioNoche ? "border-red-500" : "border-primary"
                }`}
              >
                {/* Usamos el mismo icono de billete dorado */}
                <Banknote color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("precioNoche", { valueAsNumber: true })}
                  step="0.01"
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full outline-none"
                  placeholder="Ej. 2500"
                  type="number"
                />
              </div>
              {errors.precioNoche && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.precioNoche.message)}
                </p>
              )}
            </div>

            {/* Sección de Depósito de Garantía */}
            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Depósito de Garantía (MXN)
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 bg-white ${
                  errors.montoGarantia ? "border-red-500" : "border-primary"
                }`}
              >
                {/* Usamos el mismo icono de billete dorado */}
                <Banknote color="#d4af37" className="w-5 h-5" />
                <input
                  {...register("montoGarantia", { valueAsNumber: true })}
                  step="0.01"
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral w-full outline-none"
                  placeholder="Ej. 2000"
                  type="number"
                />
              </div>
              {errors.montoGarantia && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.montoGarantia.message)}
                </p>
              )}
            </div>

            {/* Sección de Fechas de Estancia */}
            <div>
              <div className="font-body font-medium mb-1 text-sm md:text-base">
                Fechas de Estancia
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 ${errors.fechaEntrada || errors.fechaSalida ? "border-red-500" : "border-primary"}`}
              >
                {/* Nota: Asegúrate de que DateRangePicker internamente maneje bien el ancho completo (w-full) */}
                <DateRangePicker onRangeChange={handleDateChange} />
              </div>
              {(errors.fechaEntrada || errors.fechaSalida) && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  Debe seleccionar un rango de fechas válido
                </p>
              )}
            </div>
            {/* Sección de Hospedaje */}
            <div>
              <div className="font-body text-surface font-medium mb-1 text-sm md:text-base">
                Días de Hospedaje
              </div>
              <div
                className={`border rounded-md p-2 flex items-center gap-2 bg-gray-50 ${
                  errors.diasHospedaje ? "border-red-500" : "border-primary"
                }`}
              >
                <input
                  type="number"
                  readOnly
                  placeholder="0"
                  className="flex-1 border-none bg-transparent focus:ring-0 text-body-lg p-0 text-neutral-500 cursor-not-allowed outline-none font-semibold w-full"
                  {...register("diasHospedaje", { valueAsNumber: true })}
                />
                <span className="text-gray-400 text-sm font-medium pr-2 select-none">
                  Noches
                </span>
              </div>
              {errors.diasHospedaje && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {String(errors.diasHospedaje.message)}
                </p>
              )}
            </div>

            <div className="mt-3 border-t border-gray-200 pt-4 md:mx-4 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-body text-surface font-semibold text-sm md:text-base ">
                  Costos Extras Adicionales (Eventos / Servicios)
                </div>
                <button
                  type="button"
                  onClick={agregarExtra}
                  className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-all shadow-sm"
                >
                  + Agregar Extra
                </button>
                <button
                  type="button"
                  onClick={agregarJardin}
                  className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-all shadow-sm ml-1"
                >
                  + Agregar Jardín
                </button>
              </div>

              {/* Mensaje si el arreglo está vacío */}
              {extrasFields.length === 0 && (
                <p className="text-gray-400 text-xs italic bg-gray-50 p-3 rounded-md border border-dashed border-gray-200 text-center">
                  No se han registrado costos adicionales a esta reservación.
                </p>
              )}

              {/* Contenedor de la lista con scroll si pasa de 250px */}
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                {extrasFields.map((field, index) => {
                  const conceptoActual = watch(`extras.${index}.concepto`);
                  const mostrarInputOtros = conceptoActual === "Otros";
                  const esFilaJardin = conceptoActual === "Jardin";
                  const filaError = (errors.extras as any)?.[index];

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row gap-3 items-start bg-gray-50 p-3 rounded-md border border-gray-200 relative animate-fadeIn"
                    >
                      <div
                        className={`flex flex-col sm:flex-row gap-3 items-end p-3 rounded-xl border transition-all duration-200 relative ${
                          esFilaJardin
                            ? "bg-ohsunny/5 border-ohsunny/20 shadow-xs"
                            : "bg-surfacecontainer/40 border-black/5"
                        }`}
                      >
                        {/* 1. Concepto */}
                        <div className="flex-1 w-full">
                          <div className="text-[11px] text-gray-500 font-medium mb-0.5">
                            Concepto
                          </div>
                          <div
                            className={`border rounded-md p-2 bg-white flex items-center ${
                              filaError?.concepto
                                ? "border-red-500"
                                : "border-gray-300 focus-within:border-primary"
                            }`}
                          >
                            <select
                              {...register(`extras.${index}.concepto` as const)}
                              defaultValue=""
                              className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full"
                              data-jardin={esFilaJardin}
                            >
                              {esFilaJardin ? (
                                // Si la fila se creó con el botón de Jardín, solo mostramos Jardín (no hay otra opción a la cual cambiarse)
                                <option value="Jardin">Jardin</option>
                              ) : (
                                // Si la fila es normal, mostramos todo el catálogo tradicional y ocultamos Jardín
                                <>
                                  <option value="" disabled>
                                    Selecciona un concepto
                                  </option>
                                  <option value="Servicio de cocina">
                                    Servicio de cocina
                                  </option>
                                  <option value="Cocineros">Cocineros</option>
                                  <option value="Ayudantes">Ayudantes</option>
                                  <option value="Salida Tardia">
                                    Salida Tardia
                                  </option>
                                  <option value="Entrada Anticipada">
                                    Entrada Anticipada
                                  </option>
                                  <option value="Otros">
                                    Otros(especificar)
                                  </option>
                                </>
                              )}
                            </select>
                          </div>
                          {filaError?.concepto && (
                            <p className="text-red-500 text-[11px] mt-0.5 font-medium">
                              {String(filaError.concepto.message)}
                            </p>
                          )}
                        </div>
                        {mostrarInputOtros && (
                          <div className="animate-fadeIn mt-1">
                            <div
                              className={`border rounded-md p-2 bg-white flex items-center ${
                                (filaError as any)?.conceptoPersonalizado
                                  ? "border-red-500"
                                  : "border-gray-300 focus-within:border-primary"
                              }`}
                            >
                              <input
                                type="text"
                                {...register(
                                  `extras.${index}.otroConcepto` as const,
                                )}
                                placeholder="Escribe el concepto aquí..."
                                className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full"
                              />
                            </div>
                            {(filaError as any)?.conceptoPersonalizado && (
                              <p className="text-red-500 text-[11px] mt-0.5 font-medium">
                                {String(
                                  (filaError as any).conceptoPersonalizado
                                    .message,
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 2. Cantidad */}
                        <div className="w-full sm:w-[70px]">
  <div className="text-[11px] text-gray-500 font-medium mb-0.5 text-center">
    Cant.
  </div>

  {esFilaJardin ? (
    /* 🏡 FLUJO EXCLUSIVO DE JARDÍN: Sin input visual, solo mantiene la cuadrícula y el input oculto */
    <>
      <div className="w-full border border-transparent rounded-md p-2 text-sm text-center text-gray-400 bg-gray-200/50 select-none font-bold">
        -
      </div>
      {/* INPUT DE RESPALDO: Viaja oculto al backend valiendo 1 para tus multiplicaciones */}
      <input
        type="hidden"
        {...register(`extras.${index}.cantidad` as const, {
          valueAsNumber: true,
        })}
        value={1}
      />
    </>
  ) : (
    /* ➕ FLUJO TRADICIONAL PARA OTROS SERVICIOS (Cocineros, ayudantes, etc.) */
    <>
      <div
        className={`border rounded-md p-2 bg-white flex items-center ${
          filaError?.cantidad
            ? "border-red-500"
            : "border-gray-300 focus-within:border-primary"
        }`}
      >
        <input
          type="number"
          {...register(`extras.${index}.cantidad` as const, {
            valueAsNumber: true,
          })}
          placeholder="1"
          className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full text-center font-body"
        />
      </div>
      {filaError?.cantidad && (
        <p className="text-red-500 text-[11px] mt-0.5 font-medium text-center">
          {String(filaError.cantidad.message)}
        </p>
      )}
    </>
  )}
</div>


                        {/* 3. Días/Horas 🆕 */}
                        <div className="w-full sm:w-[70px]">
                          <div className="text-[11px] text-gray-500 font-medium mb-0.5">
                            Días
                          </div>
                          <div
                            className={`border rounded-md p-2 bg-white flex items-center ${filaError?.dias ? "border-red-500" : "border-gray-300 focus-within:border-primary"}`}
                          >
                            <input
                              type="number"
                              {...register(`extras.${index}.dias` as const)}
                              placeholder="1"
                              className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full text-center"
                            />
                          </div>
                          {filaError?.dias && (
                            <p className="text-red-500 text-[11px] mt-0.5 font-medium">
                              {String(filaError.dias.message)}
                            </p>
                          )}
                        </div>
                        {/* 🆕 4. Concepto del Evento y Comisión (%) - Ambas columnas unificadas en el flujo de Jardin */}
                        {/* 🆕 4. Columnas Condicionales del Bloque de Jardín Actualizadas */}
                        {esFilaJardin && (
                          <>
                            {/* COLUMNA A: Concepto / Tipo de Evento */}
                            <div className="w-full sm:w-[150px] animate-fadeIn flex flex-col">
                              <div className="text-[11px] text-surface font-medium mb-0.5 font-label">
                                Concepto del Evento
                              </div>
                              <div className="w-full bg-white p-2 rounded-md border border-black/10 focus-within:border-primary transition-colors shadow-xs flex items-center h-[38px]">
                                <input
                                  type="text"
                                  {...register(
                                    `extras.${index}.tipoEvento` as const,
                                  )}
                                  placeholder="Ej. Boda, XV Años..."
                                  className="w-full border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral outline-none font-body"
                                />
                              </div>
                            </div>

                            {/* 🌟 NUEVA COLUMNA: Número de Invitados / Aforo Libre */}
                            <div className="w-full sm:w-[90px] animate-fadeIn flex flex-col">
                              <div className="text-[11px] text-surface font-medium mb-0.5 font-label">
                                Invitados
                              </div>
                              <div className="w-full bg-white p-2 rounded-md border border-black/10 focus-within:border-primary transition-colors shadow-xs flex items-center h-[38px]">
                                <input
                                  type="number"
                                  {...register(
                                    `extras.${index}.invitadosEvento` as const,
                                    { valueAsNumber: true },
                                  )}
                                  placeholder="0"
                                  className="w-full border-none bg-transparent focus:ring-0 text-sm p-0 text-neutral outline-none text-center font-body"
                                />
                              </div>
                            </div>

                            {/* COLUMNA B: Comisión (%) */}
                            <div className="w-full sm:w-[70px] animate-fadeIn flex flex-col">
                              <div className="text-[11px] text-gray-500 font-medium mb-0.5 text-center sm:text-left font-label">
                                Comis. (%)
                              </div>
                              <div
                                className={`border rounded-md p-2 bg-white flex items-center h-[38px] ${
                                  filaError?.porcentajeComision
                                    ? "border-error"
                                    : "border-black/10 focus-within:border-primary"
                                }`}
                              >
                                <input
                                  type="number"
                                  {...register(
                                    `extras.${index}.porcentajeComision` as const,
                                    { valueAsNumber: true },
                                  )}
                                  placeholder="0"
                                  className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full text-center"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* 4. Precio Unitario 🆕 */}
                        <div className="w-full sm:w-[110px]">
                          <div className="text-[11px] text-gray-500 font-medium mb-0.5">
                            Precio ($)
                          </div>
                          <div
                            className={`border rounded-md p-2 bg-white flex items-center ${filaError?.precioUnitarioNoche ? "border-red-500" : "border-gray-300 focus-within:border-primary"}`}
                          >
                            <input
                              type="number"
                              {...register(
                                `extras.${index}.precioUnitarioNoche` as const,
                              )}
                              placeholder="0.00"
                              className="flex-1 border-none bg-transparent focus:ring-0 text-sm p-0 text-black outline-none w-full text-right"
                            />
                          </div>
                          {filaError?.precioUnitarioNoche && (
                            <p className="text-red-500 text-[11px] mt-0.5 font-medium">
                              {String(filaError.precioUnitarioNoche.message)}
                            </p>
                          )}
                        </div>

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => eliminarExtra(index)}
                          className="text-red-500 hover:text-red-700 p-1.5 mt-4 sm:mt-5 self-center sm:self-start bg-red-50 hover:bg-red-100 rounded-md transition-all border border-red-100 shadow-sm"
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
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mx-auto col-span-1 md:col-span-2 mt-4 w-full justify-center">
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto bg-secondary text-primary font-bold rounded-md p-2.5 px-4 cursor-pointer hover:bg-secondary/70 flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <House className="w-5 h-5" />
                <span>Limpiar Formulario</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto bg-primary text-white font-bold rounded-md p-2.5 px-4 cursor-pointer hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Check className="w-5 h-5" />
                <span>Confirmar Reserva</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div>
        {/* Sección de Últimas Capturas */}
        <div className="w-full  px-3 ">
          <div className="flex items-center gap-2 p-3">
            <ClockFadingIcon color="#1a3c34" className="w-5 h-5" />
            <span className="font-body text-surface font-semibold">
              Últimas Capturas
            </span>
          </div>

          {/* ✅ CORRECCIÓN: El estado de carga solo afecta a esta sección, no a toda la página */}
          {isLoading ? (
            <div className="text-sm text-gray-400 font-medium italic p-2">
              Cargando capturas...
            </div>
          ) : reservas.length === 0 ? (
            <p className="text-xs text-gray-400 italic p-2">
              No hay reservaciones registradas en el sistema.
            </p>
          ) : (
            reservas.map((reserva) => (
              <UltimasCapturas
                key={reserva.id}
                id={reserva.id}
                nombreCliente={`${reserva.nombreCliente} ${reserva.apellidoCliente}`}
                plataforma={reserva.origenNombre.trim()}
                noches={reserva.totalDiasReservacion}
                precio={reserva.montoTotal}
                onEdit={() => modalEdicion.abrirEditarModal(reserva)}
                onDelete={() => deleteModal.abrir(reserva.id)}
                precioxNoche={reserva.precioNoche}
                permitirEliminar={puedeBorrar}
              />
            ))
          )}
        </div>
        <ConfirmarEliminarModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.cerrar}
          onConfirm={deleteModal.confirmar}
          reservaId={deleteModal.reservaId}
          isSubmitting={deleteModal.isSubmitting}
        />
      </div>
      {/* 🆕 Inyectamos el componente del modal pasándole las propiedades expuestas por el hook de edición */}
      <EditarReservaModal
        isOpen={modalEdicion.isOpen}
        onClose={modalEdicion.cerrarModal}
        register={modalEdicion.register}
        handleSubmit={modalEdicion.handleSubmit}
        errors={modalEdicion.errors}
        isSubmitting={modalEdicion.isSubmitting}
        watch={modalEdicion.watch}
        control={modalEdicion.control}
        setValue={modalEdicion.setValue}
        isLoadingDatos={modalEdicion.isLoadingDatos}
        origenes={origenes}
        extrasFields={modalEdicion.extrasFields}
        agregarExtra={modalEdicion.agregarExtra}
        eliminarExtra={modalEdicion.eliminarExtra}
        agregarJardin={modalEdicion.agregarJardin}
      />
    </div>
  );
};
