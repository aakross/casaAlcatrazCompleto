import { Router } from "express";
import { ReservasRepository } from "./database/reservas.repository";
import { CrearReservaUseCase } from "../application/crearReserva.usecase";
import { BuscarReservaPorIdUseCase } from "../application/buscarReservaPorId.usecase";
import { ListarReservasUseCase } from "../application/listarReservasUseCase";
import { ReservasController } from "./reservas.controller";
import { OrigenReservasRepository } from "./database/origenReserva.repository";
import { ObtenerOrigenesReservaUseCase } from "../application/obtenerOrigenesReserva.usecase";
import { ObtenerFechasOcupadasUseCase } from "../application/obtener-fechas-ocupadas.usecase";
import { FechasOcupadasRepository } from "./database/fechas.repository";
import { AgregarExtraUseCase } from "../application/agregarExtra.usecase";
import { ActualizarReservaUseCase } from "../application/actualizarReserva.usecase";
import { EliminarReservaUseCase } from "../application/EliminarReservaUseCase";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../../shared/infrastructure/middleware/auth.middleware";

const reservasRouter = Router();

// Middleware opcional para poblar req.user en todas las rutas si viene token
reservasRouter.use(optionalAuthMiddleware);

const reservasRepository = new ReservasRepository();
const origenReservasRepository = new OrigenReservasRepository();
const fechasOcupadasRepository = new FechasOcupadasRepository();
const listarReservasUseCase = new ListarReservasUseCase(reservasRepository);
const buscarReservaPorIdUseCase = new BuscarReservaPorIdUseCase(
  reservasRepository,
);
const crearReservaUseCase = new CrearReservaUseCase(reservasRepository);
const obtenerOrigenesReservaUseCase = new ObtenerOrigenesReservaUseCase(
  origenReservasRepository,
);
const obtenerFechasOcupadasUseCase = new ObtenerFechasOcupadasUseCase(
  fechasOcupadasRepository,
);
const agregarExtraUseCase = new AgregarExtraUseCase(reservasRepository);
const actualizarReservaUseCase = new ActualizarReservaUseCase(
  reservasRepository,
);
const eliminarReservaUseCase = new EliminarReservaUseCase(reservasRepository);

const reservasController = new ReservasController(
  listarReservasUseCase,
  buscarReservaPorIdUseCase,
  crearReservaUseCase,
  obtenerOrigenesReservaUseCase,
  obtenerFechasOcupadasUseCase,
  agregarExtraUseCase,
  actualizarReservaUseCase,
  eliminarReservaUseCase,
);
reservasRouter.get(
  "/todas",
  reservasController.obtenerTodasLasReservas.bind(reservasController),
);
reservasRouter.get(
  "/origenes",
  reservasController.obtenerOrigenesReserva.bind(reservasController),
);
reservasRouter.post(
  "/crear-reserva",
  reservasController.crearReserva.bind(reservasController),
);
reservasRouter.get(
  "/ocupadas",
  reservasController.obtenerFechasOcupadas.bind(reservasController),
);
reservasRouter.post(
  "/:id/agregar-extra",
  reservasController.agregarExtraAlMomento.bind(reservasController),
);
reservasRouter.put(
  "/:id/actualizar",
  authMiddleware,
  reservasController.actualizarDatosReserva.bind(reservasController),
);
reservasRouter.get(
  "/:id",
  reservasController.obtenerReservaPorId.bind(reservasController),
);
reservasRouter.delete(
  "/:id/eliminar",
  authMiddleware,
  reservasController.eliminarReservacion.bind(reservasController),
);
export { reservasRouter };
