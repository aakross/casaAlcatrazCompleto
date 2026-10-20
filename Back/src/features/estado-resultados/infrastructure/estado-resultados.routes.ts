import { Router, Request, Response } from "express";
import { SqlEstadoResultadosRepository } from "./database/sql-estado-resultados.repository";
import { ObtenerEstadoResultadosUseCase } from "../application/obtener-estado-resultados.usecase";
import { ObtenerAniosDisponiblesUseCase } from "../application/obtener-anios-disponibles.usecase";
import { ObtenerCatalogosEgresosUseCase } from "../application/obtener-catalogos.usecase";
import { CrearConceptoEgresoUseCase } from "../application/crear-concepto-egreso.usecase";
import { RegistrarEgresoUseCase } from "../application/registrar-egreso.usecase";
import { ActualizarEgresoUseCase } from "../application/actualizar-egreso.usecase";
import { RegistrarProvisionIsrUseCase } from "../application/registrar-provision-isr.usecase";
import { ObtenerDetalleEgresosUseCase } from "../application/obtener-detalle-egresos.usecase";
import { ObtenerUltimosEgresosUseCase } from "../application/obtener-ultimos-egresos.usecase";
import { ObtenerDetalleExtrasUseCase } from "../application/obtener-detalle-extras.usecase";
import { ObtenerConceptosExtrasUseCase } from "../application/obtener-conceptos-extras.usecase";
import { EstadoResultadosController } from "./estado-resultados.controller";

const estadoResultadosRouter = Router();

// Composition Root del Feature
const repository = new SqlEstadoResultadosRepository();

const obtenerEstadoResultadosUseCase = new ObtenerEstadoResultadosUseCase(repository);
const obtenerAniosDisponiblesUseCase = new ObtenerAniosDisponiblesUseCase(repository);
const obtenerCatalogosEgresosUseCase = new ObtenerCatalogosEgresosUseCase(repository);
const crearConceptoEgresoUseCase = new CrearConceptoEgresoUseCase(repository);
const registrarEgresoUseCase = new RegistrarEgresoUseCase(repository);
const actualizarEgresoUseCase = new ActualizarEgresoUseCase(repository);
const registrarProvisionIsrUseCase = new RegistrarProvisionIsrUseCase(repository);
const obtenerDetalleEgresosUseCase = new ObtenerDetalleEgresosUseCase(repository);
const obtenerUltimosEgresosUseCase = new ObtenerUltimosEgresosUseCase(repository);
const obtenerDetalleExtrasUseCase = new ObtenerDetalleExtrasUseCase(repository);
const obtenerConceptosExtrasUseCase = new ObtenerConceptosExtrasUseCase(repository);

const controller = new EstadoResultadosController(
  obtenerEstadoResultadosUseCase,
  obtenerAniosDisponiblesUseCase,
  obtenerCatalogosEgresosUseCase,
  crearConceptoEgresoUseCase,
  registrarEgresoUseCase,
  actualizarEgresoUseCase,
  registrarProvisionIsrUseCase,
  obtenerDetalleEgresosUseCase,
  obtenerUltimosEgresosUseCase,
  obtenerDetalleExtrasUseCase,
  obtenerConceptosExtrasUseCase,
);

// Endpoints
estadoResultadosRouter.get("/", (req: Request, res: Response) => controller.obtenerEstadoResultados(req, res));
estadoResultadosRouter.get("/anios", (req: Request, res: Response) => controller.obtenerAniosDisponibles(req, res));
estadoResultadosRouter.get("/catalogos", (req: Request, res: Response) => controller.obtenerCatalogos(req, res));
estadoResultadosRouter.post("/conceptos", (req: Request, res: Response) => controller.crearConcepto(req, res));
estadoResultadosRouter.post("/egresos", (req: Request, res: Response) => controller.registrarEgreso(req, res));
estadoResultadosRouter.put("/egresos/:id", (req: Request, res: Response) => controller.actualizarEgreso(req, res));
estadoResultadosRouter.put("/egresos", (req: Request, res: Response) => controller.actualizarEgreso(req, res));
estadoResultadosRouter.post("/provision-isr", (req: Request, res: Response) => controller.registrarProvisionIsr(req, res));
estadoResultadosRouter.get("/ultimos-egresos", (req: Request, res: Response) => controller.obtenerUltimosEgresos(req, res));
estadoResultadosRouter.get("/egresos/detalle", (req: Request, res: Response) => controller.obtenerDetalleEgresos(req, res));
estadoResultadosRouter.get("/extras/detalle", (req: Request, res: Response) => controller.obtenerDetalleExtras(req, res));
estadoResultadosRouter.get("/extras/conceptos", (req: Request, res: Response) => controller.obtenerConceptosExtras(req, res));

export { estadoResultadosRouter };
