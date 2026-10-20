import { Router } from "express";
import { RentasRepository } from "./database/rentas.repository";
import { RentasUseCase } from "../application/rentas.usecase";
import { RentasController } from "./rentas.controller";
import { authMiddleware } from "../../../shared/infrastructure/middleware/auth.middleware";

const rentasRouter = Router();

// Inyección de dependencias
const repository = new RentasRepository();
const useCase = new RentasUseCase(repository);
const controller = new RentasController(useCase);

// Rutas de Regiones
rentasRouter.get("/regiones", (req, res) => controller.getRegiones(req, res));
rentasRouter.post("/regiones", authMiddleware, (req, res) => controller.createRegion(req, res));

// Rutas de Lugares
rentasRouter.get("/lugares", (req, res) => controller.getLugares(req, res));
rentasRouter.post("/lugares", authMiddleware, (req, res) => controller.createLugar(req, res));

// Rutas de Locales
rentasRouter.get("/locales", (req, res) => controller.getLocales(req, res));
rentasRouter.post("/locales", authMiddleware, (req, res) => controller.createLocal(req, res));
rentasRouter.put("/locales/:id", authMiddleware, (req, res) => controller.updateLocal(req, res));
rentasRouter.delete("/locales/:id", authMiddleware, (req, res) => controller.deleteLocal(req, res));

// Rutas de Contratos
rentasRouter.get("/contratos", (req, res) => controller.getContratos(req, res));
rentasRouter.post("/contratos", authMiddleware, (req, res) => controller.createContrato(req, res));
rentasRouter.put("/contratos/:id", authMiddleware, (req, res) => controller.updateContrato(req, res));
rentasRouter.put("/contratos/:id/finalizar", authMiddleware, (req, res) => controller.finalizarContrato(req, res));

// Rutas de Pagos y Auditoría
rentasRouter.get("/pagos", (req, res) => controller.getPagos(req, res));
rentasRouter.post("/pagos", authMiddleware, (req, res) => controller.createPago(req, res));
rentasRouter.put("/pagos/:id", authMiddleware, (req, res) => controller.updatePagoConAuditoria(req, res));
rentasRouter.delete("/pagos/:id", authMiddleware, (req, res) => controller.deletePagoConAuditoria(req, res));
rentasRouter.get("/pagos/auditoria/:pagoId", (req, res) => controller.getAuditoriaPago(req, res));

// Rutas de Control de Adeudos y Dashboard
rentasRouter.get("/adeudos", (req, res) => controller.getAdeudos(req, res));
rentasRouter.get("/dashboard", (req, res) => controller.getDashboard(req, res));

export { rentasRouter };
