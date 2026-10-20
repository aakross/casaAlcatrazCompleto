import { Router } from "express";
import { LoginUseCase } from "../application/login.usecase";
import { AuthController } from "./auth.controller";
import { UserRepository } from "./database/user.repository";
import { JwtTokenService } from "./jwt-token.service";

const authRouter = Router();

const userRepository = new UserRepository();
const tokenService = new JwtTokenService();
const loginUseCase = new LoginUseCase(userRepository, tokenService);
const authController = new AuthController(loginUseCase);

authRouter.post("/login", (req, res) => authController.login(req, res));

export { authRouter };
