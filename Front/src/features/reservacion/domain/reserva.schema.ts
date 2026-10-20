import { z } from "zod";

export const extraItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(), // Requerido internamente por useFieldArray
    conceptoTipo: z.string().optional().or(z.literal("")),
    concepto: z.string().min(1, "Especifica el concepto o porcentaje"),
    otroConcepto: z.string().optional().default(""),
    tipoEvento: z.string().optional().default(""),
    invitadosEvento: z
      .preprocess((val) => {
        if (
          val === "" ||
          val === null ||
          val === undefined ||
          Number.isNaN(Number(val))
        ) {
          return 0;
        }
        return Number(val);
      }, z.number().min(0).default(0))
      .optional(),
    cantidad: z.coerce.number().int().min(1, "Mínimo 1"),
    dias: z.coerce.number().int().min(1, "Mínimo 1 día/hora"),
    precioUnitarioNoche: z.coerce.number().min(1, "Precio requerido"),
    monto: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),
    porcentajeComision: z
      .preprocess((val) => {
        if (
          val === "" ||
          val === null ||
          val === undefined ||
          Number.isNaN(Number(val))
        ) {
          return 0;
        }
        return Number(val);
      }, z.number().min(0).max(100).default(0))
      .optional(),
    montoComision: z.coerce.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    // Opcional: Si quieres forzar que seleccionen un evento cuando sea Jardín
    if (
      data.concepto === "Jardin" &&
      (!data.tipoEvento || data.tipoEvento.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes especificar el tipo de evento",
        path: ["tipoEvento"],
      });
    }
  });

export const reservaSchema = z
  .object({
    nombreHuesped: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    apellidoHuesped: z
      .string()
      .min(3, "El apellido debe tener al menos 3 caracteres"),
    origenReserva: z
      .string()
      .min(1, "El origen de la reservación es obligatorio"),
    nuevoOrigenNombre: z.string().optional(),
    diasHospedaje: z.number().min(1, "Debe hospedarse al menos 1 día"),
    montoTotal: z.number().min(1, "El monto total no puede ser 0 o negativo"),
    porcentajeComision: z.preprocess(
      (val) => (val === "" || val === null ? undefined : Number(val)),
      z
        .number({ message: "El porcentaje de comisión es obligatorio" })
        .min(0, "La comisión no puede ser un valor negativo")
        .max(100, "La comisión no puede ser mayor al 100%"),
    ),
    precioNoche: z.coerce
      .number({ message: "El precio por noche es obligatorio" })
      .min(1, "El precio por noche debe ser mayor a 0"),
    montoGarantia: z.coerce
      .number({ message: "La garantía debe ser un número válido" })
      .min(0, "El monto de garantía no puede ser negativo"),

    fechaEntrada: z.string().min(1, "La fecha de entrada es obligatoria"),
    fechaSalida: z.string().min(1, "La fecha de salida es obligatoria"),
    telefono: z
      .string()
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .max(15, "El teléfono no puede tener más de 15 dígitos")
      .regex(/^[0-9]+$/, "El teléfono solo debe contener números"),
    huespedes: z
      .number()
      .int("El número de huéspedes debe ser un número entero")
      .min(1, "El número de huéspedes debe ser de al menos 1"),
    extras: z.array(extraItemSchema).default([]).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.origenReserva === "OTRO" &&
      (!data.nuevoOrigenNombre || data.nuevoOrigenNombre.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes especificar el nombre del nuevo origen",
        path: ["nuevoOrigenNombre"],
      });
    }
  });

export type ReservaFormData = z.infer<typeof reservaSchema>;
