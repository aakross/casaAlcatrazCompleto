import { z } from "zod";

export const loginSchema = z.object({
  user: z.string().min(1, "El username es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
