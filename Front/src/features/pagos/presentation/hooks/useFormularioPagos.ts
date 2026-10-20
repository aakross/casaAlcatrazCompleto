import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiPagoRepository } from "../../infrastructure/api-pago.repository";
import { RegistrarPagoUseCase } from "../../domain/registrar-pago.usecase";
import { notify } from "../../../../core/components/notifierTostify";

export const pagoSchema = z.object({
  reservacionId: z.number(),
  userCreate: z.number(),
  montoBruto: z
    .number("El monto bruto es requerido") // Si tu versión da problemas aquí, usa solo z.number()
    .positive("El monto debe ser mayor a 0"),
  conceptoPagoId: z.number(),
  origenDineroId: z.number(),
  aplicaComision: z.boolean(),
  montoComision: z.number().min(0, "La comisión no puede ser negativa"),
  fechaDeposito: z.string().nonempty("La fecha del depósito es obligatoria"),
});

export const pagoSchemaValidado = pagoSchema.superRefine((data, ctx) => {
  if (typeof data.montoBruto !== "number" || isNaN(data.montoBruto)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El monto bruto debe ser un número",
      path: ["montoBruto"],
    });
  }
  if (
    data.aplicaComision &&
    (typeof data.montoComision !== "number" || isNaN(data.montoComision))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La comisión debe ser un número",
      path: ["montoComision"],
    });
  }
});

export type PagoFormValues = z.infer<typeof pagoSchema>;

interface UseFormularioPagosProps {
  reservacionId: number;
  onExito?: () => void;
}

// Instanciamos las dependencias fuera del hook o mediante un contenedor de DI si usas uno
const pagoRepository = new ApiPagoRepository();
const registrarPagoUseCase = new RegistrarPagoUseCase(pagoRepository);

export const useFormularioPagos = ({
  reservacionId,
  onExito,
}: UseFormularioPagosProps) => {
  // Obtenemos de forma segura el userId desde tu almacenamiento de Zustand
  const getUserIdFromStorage = (): number => {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return 0;
    try {
      const parsed = JSON.parse(raw);
      return parsed.state?.user?.id || parsed.state?.userId || 1; // Ajusta según la estructura de tu store de Zustand
    } catch {
      return 1;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      reservacionId,
      userCreate: getUserIdFromStorage(),
      montoBruto: undefined,
      conceptoPagoId: 1,
      origenDineroId: 1,
      aplicaComision: false,
      montoComision: 0,
      fechaDeposito: new Date().toISOString().split("T")[0],
    },
  });

  const aplicaComision = watch("aplicaComision");
  const origenDineroId = watch("origenDineroId");

  useEffect(() => {
    if (!aplicaComision) {
      setValue("montoComision", 0);
    }
  }, [aplicaComision, setValue]);

  const onSubmit = async (data: PagoFormValues) => {
    try {
      // Ejecutamos el caso de uso de dominio de forma limpia
      await registrarPagoUseCase.execute(data);
      notify.success("¡Pago registrado correctamente!");
      reset(); // Limpia los campos del formulario tras el éxito
      if (onExito) onExito();
    } catch (error) {
      console.error("Error al registrar el pago en el dominio:", error);
    }
  };

  return {
    register,
    errors,
    setValue,
    watch,
    isSubmitting,
    aplicaComision,
    origenDineroId,
    seleccionarOrigenDinero: (id: number) =>
      setValue("origenDineroId", id, { shouldValidate: true }),
    manejarSubmit: handleSubmit(onSubmit),
  };
};
