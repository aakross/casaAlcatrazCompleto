import { Router } from "express";
import { authRouter } from "../../features/auth/infrastructure/auth.routes";
import { reservasRouter } from "../../features/reservas/infrastructure/reservas.routes";
import { ingresosRouter } from "../../features/ingresos/infrastructure/ingresos.routes";
import { resumenRouter } from "../../features/resumen/infrastructure/resumen.routes";
import reportesRouter from "../../features/reportes/infrastructure/reportes.routes";
import { estadoResultadosRouter } from "../../features/estado-resultados/infrastructure/estado-resultados.routes";
import { rentasRouter } from "../../features/rentas/infrastructure/rentas.routes";

const appRouter = Router();

// Acoplamos las rutas de cada feature con un prefijo limpio
appRouter.use("/auth", authRouter);
appRouter.use("/reservas", reservasRouter);
appRouter.use("/ingresos", ingresosRouter);
appRouter.use("/resumen", resumenRouter);
appRouter.use("/reportes", reportesRouter);
appRouter.use("/estado-resultados", estadoResultadosRouter);
appRouter.use("/rentas", rentasRouter);

export { appRouter };
