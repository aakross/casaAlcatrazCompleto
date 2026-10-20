import { Request, Response } from "express";
import { LoginUseCase } from "../application/login.usecase";

export class AuthController {
  constructor(private loginUsCase: LoginUseCase) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Usuario y contraseña son requeridos" });
        return;
      }
      const result = await this.loginUsCase.execute(username, password);

      res.status(200).json(result);
    } catch (error: any) {
      res
        .status(401)
        .json({ error: error.message || "Error de autenticación" });
    }
  }
}
