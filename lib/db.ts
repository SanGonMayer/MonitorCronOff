// lib/db.ts
import pkg from "pg";
const { Pool } = pkg;

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Configura el pool usando la cadena de conexión de tu variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Función auxiliar que ejecuta una query
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Función para inicializar la base de datos (crear la tabla, etc.)
export async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS failed_hosts (
        id SERIAL PRIMARY KEY,
        hostname VARCHAR(255) NOT NULL,
        ip_address VARCHAR(15) NOT NULL,
        filial VARCHAR(100) NOT NULL,
        times_submitted INTEGER DEFAULT 1,
        last_failure TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // (Opcional) Agregar datos de ejemplo solo si es necesario
    const result = await query(`SELECT COUNT(*) FROM failed_hosts`);
    const count = parseInt(result.rows[0].count, 10);
    if (count === 0) {
      const sampleHosts = [
        { hostname: "HOST001", filial: "1" },
        { hostname: "HOST002", filial: "1" },
        { hostname: "HOST003", filial: "2" },
        { hostname: "HOST004", filial: "3" },
        { hostname: "HOST005", filial: "5" },
        { hostname: "HOST006", filial: "8" },
        { hostname: "HOST007", filial: "13" },
        { hostname: "HOST008", filial: "21" },
        { hostname: "HOST009", filial: "34" },
        { hostname: "HOST010", filial: "55" },
      ];

      for (const host of sampleHosts) {
        const ipParts = host.hostname.match(/\d+/g);
        const ipSuffix = ipParts ? ipParts.join(".") : Math.floor(Math.random() * 255);
        const ipAddress = `192.168.1.${ipSuffix}`;
  
        await query(
          `INSERT INTO failed_hosts (hostname, ip_address, filial, times_submitted, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [host.hostname, ipAddress, host.filial]
        );
      }
    }

    console.log("Database initialized successfully with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Exportamos un objeto 'db' para que el resto del código que usa db.query siga funcionando
export const db = { query };
