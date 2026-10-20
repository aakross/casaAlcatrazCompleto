import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extender el tipo Request de Express para incluir req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        nombre: string;
        username: string;
        roleId?: number;
      };
    }
  }
}

interface JwtPayload {
  id: number;
  username: string;
  roleId?: number;
  iat?: number;
  exp?: number;
}

/**
 * Middleware para validar el token JWT en el encabezado Authorization.
 * Inyecta req.user con { id, nombre, username, roleId }.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization || req.headers["authorization"];

    if (!authHeader || typeof authHeader !== "string") {
      res.status(401).json({
        success: false,
        error: "Acceso no autorizado: No se proporcionó el token de autenticación.",
      });
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        error: "Formato de token no válido. Debe ser Bearer <token>.",
      });
      return;
    }

    const token = parts[1];
    const secretKey = process.env.JWT_SECRET || "M1N14B4ST0S";

    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        error: "Token inválido o carga útil incompleta.",
      });
      return;
    }

    // Inyectamos el usuario autenticado en la petición
    req.user = {
      id: Number(decoded.id),
      nombre: decoded.username,
      username: decoded.username,
      roleId: decoded.roleId,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        error: "La sesión ha expirado. Por favor, inicia sesión nuevamente.",
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: "Token inválido o sesión no autorizada.",
    });
  }
};

/**
 * Middleware opcional: si viene token lo decodifica e inyecta req.user,
 * pero no rechaza la petición si no se envía token (útil para retrocompatibilidad).
 */
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization || req.headers["authorization"];
    if (authHeader && typeof authHeader === "string") {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        const token = parts[1];
        const secretKey = process.env.JWT_SECRET || "M1N14B4ST0S";
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        if (decoded && decoded.id) {
          req.user = {
            id: Number(decoded.id),
            nombre: decoded.username,
            username: decoded.username,
            roleId: decoded.roleId,
          };
        }
      }
    }
  } catch {
    // Si falla la verificación opcional, simplemente no se inyecta req.user
  }
  next();
};
