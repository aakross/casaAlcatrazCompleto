// ─────────────────────────────────────────────────────────────────────────────
// Component — FormularioEgreso
// Formulario de captura con React Hook Form + Zod (validación basada en z.string)
// y conversión manual a tipos numéricos en onSubmit (parseFloat / parseInt).
// Campo 'descripcion' obligatorio conforme a los nuevos requerimientos.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Save, X } from "lucide-react";
import { notify } from "../../../../core/components/notifierTostify";
import type { useEstadoResultados } from "../hooks/useEstadoResultados";
import { obtenerFechaLocalHoyYYYYMMDD } from "../utils/date-formatter";

type HookReturn = ReturnType<typeof useEstadoResultados>;

interface Props {
  catalogos: HookReturn["catalogos"];
  isLoadingCatalogos: HookReturn["isLoadingCatalogos"];
  registrarEgreso: HookReturn["registrarEgreso"];
  crearConcepto: HookReturn["crearConcepto"];
  onSuccess: () => void;
}

// ── Esquema Zod v4: Campos numéricos como string y descripción obligatoria ──
const egresoSchema = z.object({
  categoriaId: z
    .string()
    .min(1, "Selecciona una categoría")
    .refine((val) => Number(val) > 0, "Selecciona una categoría"),
  conceptoId: z
    .string()
    .min(1, "Selecciona un concepto")
    .refine((val) => Number(val) > 0, "Selecciona un concepto"),
  monto: z
    .string()
    .min(1, "El monto es obligatorio")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "El monto debe ser mayor a 0"
    ),
  fechaGasto: z
    .string()
    .min(1, "Selecciona la fecha del gasto")
    .refine(
      (val) => val <= obtenerFechaLocalHoyYYYYMMDD(),
      "No se permiten fechas futuras. Solo se pueden registrar gastos de la fecha actual o anterior."
    ),
  referenciaComprobante: z.string().optional(),
  descripcion: z.string().min(1, "La descripción del gasto es obligatoria"),
});

type EgresoFormValues = z.infer<typeof egresoSchema>;

const nuevoConceptoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
});

type NuevoConceptoValues = z.infer<typeof nuevoConceptoSchema>;

export function FormularioEgreso({
  catalogos,
  isLoadingCatalogos,
  registrarEgreso,
  crearConcepto,
  onSuccess,
}: Props) {
  const [modoNuevoConcepto, setModoNuevoConcepto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState<number | null>(null);

  // ── React Hook Form con resolución por esquema Zod ─────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EgresoFormValues>({
    resolver: zodResolver(egresoSchema),
    defaultValues: {
      categoriaId: "",
      conceptoId: "",
      monto: "",
      fechaGasto: obtenerFechaLocalHoyYYYYMMDD(),
      referenciaComprobante: "",
      descripcion: "",
    },
  });

  const {
    register: regConcepto,
    handleSubmit: handleConceptoSubmit,
    reset: resetConcepto,
    formState: { errors: errorsConcepto },
  } = useForm<NuevoConceptoValues>({
    resolver: zodResolver(nuevoConceptoSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  const categoriaIdWatch = watch("categoriaId");

  // Filtrar conceptos según la categoría seleccionada
  const conceptosFiltrados = useMemo(() => {
    const cid = parseInt(categoriaIdWatch, 10);
    if (!cid || isNaN(cid)) return [];
    return catalogos.conceptos.filter((c) => c.categoriaId === cid);
  }, [catalogos.conceptos, categoriaIdWatch]);

  // ── Conversión manual a number dentro de onSubmit antes de llamar al backend ─
  const onSubmit = async (data: EgresoFormValues) => {
    setIsSubmitting(true);
    try {
      const conceptoId = parseInt(data.conceptoId, 10);
      const monto = parseFloat(data.monto);

      await registrarEgreso({
        conceptoId,
        monto,
        fechaGasto: data.fechaGasto,
        referenciaComprobante: data.referenciaComprobante?.trim() || undefined,
        descripcion: data.descripcion.trim(),
      });

      notify.success("Egreso registrado correctamente.");
      reset({
        categoriaId: "",
        conceptoId: "",
        monto: "",
        fechaGasto: obtenerFechaLocalHoyYYYYMMDD(),
        referenciaComprobante: "",
        descripcion: "",
      });
      setCategoriaSeleccionadaId(null);
      onSuccess();
    } catch {
      notify.error("No se pudo registrar el egreso. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Registrar nuevo concepto dinámico ─────────────────────────────────────
  const onGuardarConcepto = async (data: NuevoConceptoValues) => {
    if (!categoriaSeleccionadaId) {
      notify.error("Selecciona primero una categoría.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevo = await crearConcepto({
        categoriaId: categoriaSeleccionadaId,
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || undefined,
      });

      notify.success(`Concepto "${nuevo.nombre}" creado exitosamente.`);
      resetConcepto();
      setModoNuevoConcepto(false);
      setValue("conceptoId", String(nuevo.id), { shouldValidate: true });
    } catch {
      notify.error("No se pudo crear el concepto. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelCls = "block text-xs font-semibold text-neutral/70 mb-1 uppercase tracking-wider font-body";
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-neutral/20 bg-surfacecontainer text-neutral font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60 transition";
  const errorCls = "mt-1 text-xs text-error font-body";

  return (
    <div className="bg-surfacecontainer rounded-2xl p-6 shadow-sm border border-neutral/10 space-y-5">
      <h3 className="font-headline text-primary text-xl font-bold">
        Registrar Egreso
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Selector de Categoría */}
        <div>
          <label className={labelCls}>Categoría *</label>
          <select
            {...register("categoriaId")}
            disabled={isLoadingCatalogos || isSubmitting}
            onChange={(e) => {
              const val = e.target.value;
              const numericId = parseInt(val, 10);
              setCategoriaSeleccionadaId(!isNaN(numericId) && numericId > 0 ? numericId : null);
              setValue("categoriaId", val, { shouldValidate: true });
              setValue("conceptoId", "", { shouldValidate: true });
              setModoNuevoConcepto(false);
            }}
            className={inputCls}
          >
            <option value="">
              {isLoadingCatalogos ? "Cargando categorías..." : "Selecciona una categoría"}
            </option>
            {catalogos.categorias.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errors.categoriaId && <p className={errorCls}>{errors.categoriaId.message}</p>}
        </div>

        {/* Selector de Concepto en cascada */}
        {!modoNuevoConcepto && (
          <div>
            <label className={labelCls}>Concepto *</label>
            <div className="flex gap-2">
              <select
                {...register("conceptoId")}
                disabled={!categoriaSeleccionadaId || isSubmitting}
                className={`${inputCls} flex-1`}
              >
                <option value="">Selecciona un concepto</option>
                {conceptosFiltrados.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {categoriaSeleccionadaId && (
                <button
                  type="button"
                  onClick={() => setModoNuevoConcepto(true)}
                  title="Agregar nuevo concepto"
                  className="flex items-center gap-1 px-3 py-2 bg-secondary text-primary rounded-lg text-xs font-semibold hover:opacity-90 transition shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nuevo
                </button>
              )}
            </div>
            {errors.conceptoId && <p className={errorCls}>{errors.conceptoId.message}</p>}
          </div>
        )}

        {/* Panel inline para agregar concepto */}
        {modoNuevoConcepto && (
          <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary font-body">
                Nuevo concepto para:{" "}
                <span className="text-secondary">
                  {catalogos.categorias.find((c) => c.id === categoriaSeleccionadaId)?.nombre}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setModoNuevoConcepto(false)}
                className="text-neutral/40 hover:text-error transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className={labelCls}>Nombre del concepto *</label>
              <input
                {...regConcepto("nombre")}
                type="text"
                placeholder="Ej. Honorarios contador"
                className={inputCls}
              />
              {errorsConcepto.nombre && <p className={errorCls}>{errorsConcepto.nombre.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Descripción del concepto (opcional)</label>
              <input
                {...regConcepto("descripcion")}
                type="text"
                placeholder="Descripción breve del catálogo"
                className={inputCls}
              />
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConceptoSubmit(onGuardarConcepto)}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 font-body"
            >
              {isSubmitting ? "Guardando..." : "Guardar concepto"}
            </button>
          </div>
        )}

        {/* Campo Monto */}
        <div>
          <label className={labelCls}>Monto (MXN) *</label>
          <input
            {...register("monto")}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={inputCls}
          />
          {errors.monto && <p className={errorCls}>{errors.monto.message}</p>}
        </div>

        {/* Fecha del gasto */}
        <div>
          <label className={labelCls}>Fecha del gasto *</label>
          <input
            {...register("fechaGasto")}
            type="date"
            max={obtenerFechaLocalHoyYYYYMMDD()}
            className={inputCls}
          />
          {errors.fechaGasto && <p className={errorCls}>{errors.fechaGasto.message}</p>}
        </div>

        {/* Referencia o Comprobante */}
        <div>
          <label className={labelCls}>Referencia / Comprobante</label>
          <input
            {...register("referenciaComprobante")}
            type="text"
            placeholder="Folio, factura o ticket (opcional)"
            className={inputCls}
          />
        </div>

        {/* Descripción (Obligatoria conforme al requerimiento 4) */}
        <div>
          <label className={labelCls}>Descripción *</label>
          <textarea
            {...register("descripcion")}
            rows={2}
            placeholder="Detalle o motivo del gasto (obligatorio)..."
            className={`${inputCls} resize-none`}
          />
          {errors.descripcion && <p className={errorCls}>{errors.descripcion.message}</p>}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 font-body shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4 text-secondary" />
          {isSubmitting ? "Guardando egreso..." : "Registrar Egreso"}
        </button>
      </form>
    </div>
  );
}
