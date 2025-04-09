// lib/db.ts
import 'dotenv/config';
import pkg from "pg";
const { Pool } = pkg;

console.log("DATABASE_URL in db.ts:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS failed_hosts (
        id SERIAL PRIMARY KEY,
        hostname VARCHAR(255) NOT NULL,
        ip_address VARCHAR(15) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        failure_count INTEGER DEFAULT 1,
        last_failure TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // (Opcional) Inserción de datos de prueba si la tabla está vacía
    const result = await query(`SELECT COUNT(*) FROM failed_hosts`);
    const count = parseInt(result.rows[0].count, 10);
    if (count === 0) {
      const sampleHosts = [
        { hostname: "HOST001", branch: "1" },
        { hostname: "HOST002", branch: "1" },
        { hostname: "HOST003", branch: "2" },
        { hostname: "HOST004", branch: "3" },
        { hostname: "HOST005", branch: "5" },
        { hostname: "HOST006", branch: "8" },
        { hostname: "HOST007", branch: "13" },
        { hostname: "HOST008", branch: "21" },
        { hostname: "HOST009", branch: "34" },
        { hostname: "HOST010", branch: "55" },
      ];
      
      for (const host of sampleHosts) {
        const ipParts = host.hostname.match(/\d+/g);
        const ipSuffix = ipParts ? ipParts.join(".") : Math.floor(Math.random() * 255);
        const ipAddress = `192.168.1.${ipSuffix}`;

        await query(
          `INSERT INTO failed_hosts (hostname, ip_address, branch, failure_count, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [host.hostname, ipAddress, host.branch]
        );
      }
    }

    console.log("Database initialized successfully with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export const db = { query };
