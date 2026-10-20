import { Router } from "express";
import { IngresosRepository } from "./database/ingresos.repository";
import { CrearIngresoUsecase } from "../application/crearIngreso.usecase";
import { IngresosController } from "./ingresos.controller";
import { BuscarPagosPorReservaUseCase } from "../application/detallePagosXCliente.usecase";
import { EliminarPagoUseCase } from "../application/EliminarPagoUseCase";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../../shared/infrastructure/middleware/auth.middleware";

const ingresosRouter = Router();

// Middleware opcional para poblar req.user si viene token
ingresosRouter.use(optionalAuthMiddleware);

const ingresosRepository = new IngresosRepository();
const crearIngresoUseCase = new CrearIngresoUsecase(ingresosRepository);
const buscarPagosPorReservaUseCase = new BuscarPagosPorReservaUseCase(
  ingresosRepository,
);
const eliminarPagoUseCase = new EliminarPagoUseCase(ingresosRepository);

const ingresosController = new IngresosController(
  crearIngresoUseCase,
  buscarPagosPorReservaUseCase,
  eliminarPagoUseCase,
);

ingresosRouter.post(
  "/crear-ingreso",
  ingresosController.insertarIngreso.bind(ingresosController),
);
ingresosRouter.get(
  "/:id",
  ingresosController.obtenerPagosPorReserva.bind(ingresosController),
);
ingresosRouter.delete(
  "/pago/:id",
  authMiddleware,
  ingresosController.eliminarAbonoDeCaja.bind(ingresosController),
);
export { ingresosRouter };
