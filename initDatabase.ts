import dotenv from "dotenv";
dotenv.config({ path: ".env" }); // Esto carga el archivo .env que está en la raíz

import { initDatabase } from "./lib/db.js";

(async () => {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    await initDatabase();
    console.log("Script finalizado exitosamente.");
  } catch (error) {
    console.error("Ocurrió un error en la inicialización:", error);
    process.exit(1);
  }
})();
