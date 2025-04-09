import dotenv from "dotenv";
dotenv.config();

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
