import "./config/env";
import express, { Request, Response } from "express";
import { initializeDatabase } from "./shared/infrastructure/db-init";
import { appRouter } from "./shared/infrastructure/app.routes";
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());

app.use(
  cors({
    origin: "*", //'http://172.16.3.213:5173',
    //credentials: true
  }),
);
// Ruta de prueba principal (Fuera de la función para mayor orden)
app.get("/casaalcatraz", (req: Request, res: Response) => {
  res.json({
    ok: true,
    message: "¡Servidor de Casa Alcatraz funcionando correctamente!",
  });
});

// Función asíncrona para inicializar servicios y arrancar el servidor
const startApplication = async () => {
  try {
    // 1. Inicializa la infraestructura compartida (BD y Tablas)
    await initializeDatabase();
    app.use("/casaalcatraz/api/v1", appRouter);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ No se pudo arrancar la aplicación:", error);
    process.exit(1); // Detiene todo si la infraestructura falla
  }
};

// Ejecutamos el arranque
startApplication();
