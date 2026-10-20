import mssql from "mssql";
import { dbConfig } from "../../config/database";

// Importamos el script desde la infraestructura del módulo auth
import { createUsuariosTable } from "../../features/auth/infrastructure/database/create-table-ususarios";
import { createReservasTable } from "../../features/reservas/infrastructure/database/create-table-reservas";
import { createEgresosTable } from "../../features/estado-resultados/infrastructure/database/create-table-egresos";
import { createRentasTable } from "../../features/rentas/infrastructure/database/create-table-rentas";

// En este arreglo se agregan los scripts de inicialización de las tablas de los features
const scriptsDeInicializacion: string[] = [
  createUsuariosTable,
  createReservasTable,
  createEgresosTable,
  createRentasTable,
];

export const initializeDatabase = async (): Promise<mssql.ConnectionPool> => {
  try {
    const pool = await mssql.connect(dbConfig);
    console.log("📦 Base de datos conectada con éxito.");

    for (const script of scriptsDeInicializacion) {
      await pool.request().query(script);
    }

    console.log(
      "🚀 Todas las tablas de los features han sido verificadas/creadas.",
    );
    return pool;
  } catch (error) {
    console.error("❌ Error crítico en la infraestructura de BD:", error);
    process.exit(1);
  }
};
