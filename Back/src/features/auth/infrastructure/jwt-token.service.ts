import jwt from "jsonwebtoken";
import { ITokenService } from "../domain/token-service";

export class JwtTokenService implements ITokenService {
  private readonly secrectKey = process.env.JWT_SECRET || "default_secret_key";

  generateToken(payload: {
    id: number;
    username: string;
    roleId: number;
  }): string {
    return jwt.sign(payload, this.secrectKey, { expiresIn: "30d" });
  }
}
