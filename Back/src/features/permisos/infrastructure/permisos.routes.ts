import { Router } from "express";
import { PermisosRepository } from "./database/permisos.repository";
import { PermisosUseCase } from "../application/permisos.usecase";
import { PermisosController } from "./permisos.controller";

const permisosRouter = Router();

const repository = new PermisosRepository();
const useCase = new PermisosUseCase(repository);
const controller = new PermisosController(useCase);

// Endpoints
permisosRouter.get("/modulos", (req, res) => controller.getModulos(req, res));
permisosRouter.get("/usuarios", (req, res) => controller.getUsuariosConPermisos(req, res));
permisosRouter.post("/toggle", (req, res) => controller.togglePermiso(req, res));
permisosRouter.post("/usuarios/toggle-estado", (req, res) => controller.toggleEstadoUsuario(req, res));
permisosRouter.put("/usuarios/:id", (req, res) => controller.guardarPermisosUsuario(req, res));
permisosRouter.post("/usuarios/verificar-tcausr", (req, res) => controller.verificarTcausr(req, res));
permisosRouter.post("/usuarios/crear", (req, res) => controller.crearUsuario(req, res));
permisosRouter.post("/usuarios/cambiar-password", (req, res) => controller.cambiarPasswordPrimerIngreso(req, res));

export { permisosRouter };
