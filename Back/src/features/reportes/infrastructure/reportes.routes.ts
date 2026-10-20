import { Router } from "express";
import { SqlServerReporteRepository } from "./database/reportes.repository";
import { ObtenerReporteGeneralUseCase } from "../application/reportes.usecase";
import { ReportesController } from "./reportes.controller";

const reportesRouter = Router();

const reporteRepository = new SqlServerReporteRepository();
const obtenerReporteGeneralUseCase = new ObtenerReporteGeneralUseCase(
  reporteRepository,
);
const reportesController = new ReportesController(obtenerReporteGeneralUseCase);

// GET /api/reportes/general
reportesRouter.get("/general", reportesController.obtenerReporteGeneral);
reportesRouter.get(
  "/bitacora-borrados",
  reportesController.obtenerBitacoraBorrados,
);

export default reportesRouter;
