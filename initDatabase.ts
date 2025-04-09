import dotenv from "dotenv";
// Cargar explícitamente el archivo .env.local
dotenv.config({ path: '.env' });

import { initDatabase } from "./lib/db.js";

(async () => {
  try {
    await initDatabase();
    console.log("Script finalizado exitosamente.");
  } catch (error) {
    console.error("Ocurrió un error en la inicialización:", error);
    process.exit(1);
  }
})();
