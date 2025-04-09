const { Pool } = require("pg")

// Clase para base de datos en memoria (fallback)
class InMemoryDB {
  constructor() {
    this.hosts = []
    this.idCounter = 1
  }

  async query(text, params) {
    console.log("Usando base de datos en memoria")

    // Simulación de consultas SQL básicas
    if (text.includes("CREATE TABLE")) {
      return { rows: [] }
    } else if (text.includes("SELECT * FROM failed_hosts")) {
      return { rows: this.hosts }
    } else if (text.includes("SELECT id FROM failed_hosts WHERE hostname =")) {
      const hostname = params?.[0]
      const existingHost = this.hosts.find((h) => h.hostname === hostname)
      return { rows: existingHost ? [existingHost] : [] }
    } else if (text.includes("UPDATE failed_hosts")) {
      const hostname = params?.[0]
      const hostIndex = this.hosts.findIndex((h) => h.hostname === hostname)
      if (hostIndex !== -1) {
        this.hosts[hostIndex].failure_count += 1
        this.hosts[hostIndex].last_failure = new Date()
      }
      return { rows: [] }
    } else if (text.includes("INSERT INTO failed_hosts")) {
      const [hostname, ipAddress, branch] = params || []
      const newHost = {
        id: this.idCounter++,
        hostname,
        ip_address: ipAddress,
        branch,
        failure_count: 1,
        last_failure: new Date(),
        created_at: new Date(),
      }
      this.hosts.push(newHost)
      return { rows: [newHost] }
    } else if (text.includes("SELECT branch, SUM(failure_count)") || text.includes("GROUP BY branch")) {
      const branchStats = this.hosts.reduce((acc, host) => {
        if (!acc[host.branch]) {
          acc[host.branch] = 0
        }
        acc[host.branch] += host.failure_count
        return acc
      }, {})

      return {
        rows: Object.entries(branchStats).map(([branch, count]) => ({
          branch,
          count,
        })),
      }
    } else if (text.includes("SELECT hostname, failure_count")) {
      return {
        rows: [...this.hosts]
          .sort((a, b) => b.failure_count - a.failure_count)
          .slice(0, 10)
          .map((host) => ({
            hostname: host.hostname,
            count: host.failure_count,
          })),
      }
    } else if (text.includes("SELECT COUNT(*)")) {
      return { rows: [{ count: this.hosts.length }] }
    }

    return { rows: [] }
  }
}

// Intentar crear un pool de conexiones PostgreSQL
let db
try {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  // Probar la conexión
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Error al conectar con PostgreSQL:", err)
      console.log("Usando base de datos en memoria como fallback")
      db = new InMemoryDB()
    } else {
      console.log("Conectado a PostgreSQL")
      db = pool
    }
  })
} catch (error) {
  console.error("Error al inicializar PostgreSQL:", error)
  console.log("Usando base de datos en memoria como fallback")
  db = new InMemoryDB()
}

// Función para ejecutar consultas
const query = (text, params) => db.query(text, params)

// Inicializar la base de datos
const initDatabase = async () => {
  try {
    // Crear la tabla failed_hosts si no existe
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
    `)

    // Verificar si hay datos de ejemplo
    const existingData = await query("SELECT COUNT(*) FROM failed_hosts")

    // Si no hay datos, agregar algunos ejemplos
    if (Number.parseInt(existingData.rows[0].count) === 0) {
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
      ]

      for (const host of sampleHosts) {
        const ipParts = host.hostname.match(/\d+/g)
        const ipSuffix = ipParts ? ipParts.join(".") : Math.floor(Math.random() * 255)
        const ipAddress = `192.168.1.${ipSuffix}`

        await query(
          `INSERT INTO failed_hosts (hostname, ip_address, branch, failure_count, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [host.hostname, ipAddress, host.branch],
        )
      }
    }

    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    throw error
  }
}

module.exports = {
  query,
  initDatabase,
}
