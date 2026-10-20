import { ITokenService } from "../domain/token-service";
import { IUserRepository } from "../domain/user.repository";

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute(
    username: string,
    password: string,
  ): Promise<{
    success: boolean;
    id: number;
    username: string;
    roleId: number;
    isActive: boolean;
    token: string;
    borrar: boolean;
  }> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    if (user.password !== password) {
      throw new Error("Contraseña incorrecta, vuelve a intentarlo");
    }
    if (!user.isActive) {
      throw new Error("Usuario inactivo, contacta al administrador");
    }

    const token = this.tokenService.generateToken({
      id: user.id,
      username: user.username,
      roleId: user.roleId,
    });

    return {
      success: true,
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      isActive: user.isActive,
      token,
      borrar: user.borrar,
    };
  }
}
