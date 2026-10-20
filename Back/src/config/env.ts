import dotenv from "dotenv";
import path from "path";

// 1. Cargamos el archivo .env principal donde está el selector NODE_ENV (dev / prd)
dotenv.config();

const rawEnv = (process.env.NODE_ENV || process.env.APP_ENV || "dev").toLowerCase().trim();
const isProduction = rawEnv === "prd" || rawEnv === "prod" || rawEnv === "production";
const envFileName = isProduction ? ".env.production" : ".env.development";

// 2. Sobrescribimos con el archivo de ambiente seleccionado (.env.development o .env.production)
const envFilePath = path.resolve(process.cwd(), envFileName);
dotenv.config({ path: envFilePath, override: true });

console.log(`🌍 [Entorno] Modo activo: ${isProduction ? "PRODUCCIÓN (prd)" : "DESARROLLO (dev)"}`);
console.log(`📁 [Entorno] Archivo cargado: ${envFileName}`);
console.log(`🔌 [Base de Datos] Servidor destino: ${process.env.DB_SERVER} (BD: ${process.env.DB_NAME})`);

export const ENV_MODE = isProduction ? "prd" : "dev";
export const IS_PRODUCTION = isProduction;
