// ─────────────────────────────────────────────────────────────────────────────
// Component — ModalEditarEgreso
// Formulario modal de edición de egresos con React Hook Form + Zod (v4).
// Permite modificar el concepto, monto, fecha, referencia y descripción
// garantizando la auditoría en la bitácora del sistema (SQL Server 2008 R2).
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save, Edit3, DollarSign, Calendar, FileText, Layers } from "lucide-react";
import { notify } from "../../../../core/components/notifierTostify";
import type {
  CatalogosData,
  EgresoDetalleItem,
  ActualizarEgresoPayload,
} from "../../domain/estado-resultados.repository";
import { obtenerFechaLocalHoyYYYYMMDD } from "../utils/date-formatter";

interface Props {
  egreso: EgresoDetalleItem | null;
  isOpen: boolean;
  onClose: () => void;
  catalogos: CatalogosData;
  actualizarEgreso: (
    payload: Omit<ActualizarEgresoPayload, "usuarioId" | "usuarioNombre">
  ) => Promise<void>;
  onSuccess: () => void;
}

// ── Esquema Zod v4 para validación estricta de edición ──────────────────────
export const editarEgresoSchema = z.object({
  categoriaId: z
    .string()
    .min(1, "Selecciona una categoría de gasto")
    .refine((val) => Number(val) > 0, "Categoría inválida"),
  conceptoId: z
    .string()
    .min(1, "Selecciona un concepto de gasto")
    .refine((val) => Number(val) > 0, "Concepto inválido"),
  monto: z
    .string()
    .min(1, "El monto es obligatorio")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "El monto debe ser un número mayor a 0"
    ),
  fechaGasto: z
    .string()
    .min(1, "La fecha del gasto es obligatoria")
    .refine(
      (val) => val <= obtenerFechaLocalHoyYYYYMMDD(),
      "No se permiten fechas futuras. Solo se pueden registrar egresos con fecha del día en curso hacia atrás."
    ),
  referenciaComprobante: z.string().optional(),
  descripcion: z
    .string()
    .min(1, "La descripción del gasto es obligatoria")
    .max(500, "La descripción no puede exceder 500 caracteres"),
});

export type EditarEgresoFormValues = z.infer<typeof editarEgresoSchema>;

export function ModalEditarEgreso({
  egreso,
  isOpen,
  onClose,
  catalogos,
  actualizarEgreso,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditarEgresoFormValues>({
    resolver: zodResolver(editarEgresoSchema),
    defaultValues: {
      categoriaId: "",
      conceptoId: "",
      monto: "",
      fechaGasto: "",
      referenciaComprobante: "",
      descripcion: "",
    },
  });

  const categoriaIdWatch = watch("categoriaId");

  // Al abrir el modal o cambiar el egreso, poblar el formulario
  useEffect(() => {
    if (egreso && isOpen) {
      reset({
        categoriaId: String(egreso.categoriaId || ""),
        conceptoId: String(egreso.conceptoId || ""),
        monto: String(egreso.monto || ""),
        fechaGasto: egreso.fechaGasto ? egreso.fechaGasto.split("T")[0] : "",
        referenciaComprobante: egreso.referenciaComprobante || "",
        descripcion: egreso.descripcion || "",
      });
    }
  }, [egreso, isOpen, reset]);

  // Conceptos filtrados según la categoría seleccionada
  const conceptosFiltrados = useMemo(() => {
    if (!categoriaIdWatch) return [];
    return catalogos.conceptos.filter(
      (c) => c.categoriaId === Number(categoriaIdWatch)
    );
  }, [categoriaIdWatch, catalogos.conceptos]);

  // Si cambia la categoría y el concepto actual no pertenece a ella, resetear concepto
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaCatId = e.target.value;
    setValue("categoriaId", nuevaCatId, { shouldValidate: true });
    setValue("conceptoId", "", { shouldValidate: true });
  };

  const onSubmit = async (values: EditarEgresoFormValues) => {
    if (!egreso) return;

    setIsSubmitting(true);
    try {
      await actualizarEgreso({
        id: egreso.id,
        conceptoId: Number(values.conceptoId),
        monto: parseFloat(values.monto),
        fechaGasto: values.fechaGasto,
        referenciaComprobante: values.referenciaComprobante?.trim() || undefined,
        descripcion: values.descripcion.trim(),
      });

      notify.success("Egreso actualizado y registrado en bitácora exitosamente.");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || "Error al actualizar el egreso.";
      notify.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !egreso) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surfacecontainer w-full max-w-lg rounded-2xl shadow-xl border border-neutral/15 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="bg-primary px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-secondary">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold">
                Editar Registro de Egreso
              </h3>
              <p className="text-xs text-white/70 font-body">
                ID #{egreso.id} — Modificación auditada con bitácora
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-neutral/80 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-body">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              Categoría (Tipo de Gasto) <span className="text-error">*</span>
            </label>
            <select
              {...register("categoriaId")}
              onChange={handleCategoriaChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-xs font-body font-medium rounded-lg border border-neutral/20 bg-white text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer"
            >
              <option value="">Selecciona una categoría</option>
              {catalogos.categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId && (
              <p className="text-[11px] text-error mt-1 font-body">
                {errors.categoriaId.message}
              </p>
            )}
          </div>

          {/* Concepto Dependiente */}
          <div>
            <label className="block text-xs font-semibold text-neutral/80 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-body">
              <FileText className="w-3.5 h-3.5 text-secondary" />
              Concepto <span className="text-error">*</span>
            </label>
            <select
              {...register("conceptoId")}
              disabled={!categoriaIdWatch || isSubmitting}
              className="w-full px-3 py-2 text-xs font-body font-medium rounded-lg border border-neutral/20 bg-white text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {categoriaIdWatch
                  ? "Selecciona un concepto"
                  : "Primero selecciona una categoría"}
              </option>
              {conceptosFiltrados.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.nombre}
                </option>
              ))}
            </select>
            {errors.conceptoId && (
              <p className="text-[11px] text-error mt-1 font-body">
                {errors.conceptoId.message}
              </p>
            )}
          </div>

          {/* Grid: Monto y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monto */}
            <div>
              <label className="block text-xs font-semibold text-neutral/80 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-body">
                <DollarSign className="w-3.5 h-3.5 text-secondary" />
                Monto ($ MXN) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
                {...register("monto")}
                className="w-full px-3 py-2 text-xs font-body font-medium rounded-lg border border-neutral/20 bg-white text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60"
              />
              {errors.monto && (
                <p className="text-[11px] text-error mt-1 font-body">
                  {errors.monto.message}
                </p>
              )}
            </div>

            {/* Fecha de Gasto */}
            <div>
              <label className="block text-xs font-semibold text-neutral/80 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-body">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                Fecha del Gasto <span className="text-error">*</span>
              </label>
              <input
                type="date"
                max={obtenerFechaLocalHoyYYYYMMDD()}
                disabled={isSubmitting}
                {...register("fechaGasto")}
                className="w-full px-3 py-2 text-xs font-body font-medium rounded-lg border border-neutral/20 bg-white text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60"
              />
              {errors.fechaGasto && (
                <p className="text-[11px] text-error mt-1 font-body">
                  {errors.fechaGasto.message}
                </p>
              )}
            </div>
          </div>

          {/* Referencia / Comprobante */}
          <div>
            <label className="block text-xs font-semibold text-neutral/80 uppercase tracking-wider mb-1 font-body">
              Referencia / No. Comprobante (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Factura A-1024, Ticket 5543..."
              disabled={isSubmitting}
              {...register("referenciaComprobante")}
              className="w-full px-3 py-2 text-xs font-body font-medium rounded-lg border border-neutral/20 bg-white text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-neutral/80 uppercase tracking-wider mb-1 font-body">
              Descripción del Gasto <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detalla en qué consistió el egreso..."
              disabled={isSubmitting}
              {...register("descripcion")}
              className="w-full px-3 py-2 text-xs font-body font-medium rounded-lg border border-neutral/20 bg-white text-neutral focus:outline-none focus:ring-2 focus:ring-secondary/60 resize-none"
            />
            {errors.descripcion && (
              <p className="text-[11px] text-error mt-1 font-body">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-neutral/20 rounded-xl text-neutral font-semibold text-xs hover:bg-neutral/5 transition cursor-pointer font-body disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl font-semibold text-xs hover:opacity-90 transition cursor-pointer font-body shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-secondary" />
              {isSubmitting ? "Guardando cambios..." : "Guardar Modificación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
