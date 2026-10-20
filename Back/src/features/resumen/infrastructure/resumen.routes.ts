import { Router } from "express";
import { ResumenRepository } from "./database/resumen.repository";
import { ResumenUseCase } from "../application/resumen.usecase";
import { ResumenController } from "./resumen.controller";
import { ObtenerDashboardCompletoUseCase } from "../application/obtenerdashboardcompleto.usecase";

const resumenRouter = Router();
const resumenRepository = new ResumenRepository();
const resumenUseCase = new ResumenUseCase(resumenRepository);
const obtenerdashboardcompletoUsecase = new ObtenerDashboardCompletoUseCase(
  resumenRepository,
);
const resumenController = new ResumenController(
  resumenUseCase,
  obtenerdashboardcompletoUsecase,
);

resumenRouter.get(
  "/info",
  resumenController.obtenerResumen.bind(resumenController),
);
resumenRouter.get(
  "/dashboard",
  resumenController.obtenerResumenCompleto.bind(resumenController),
);
export { resumenRouter };
