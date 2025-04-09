const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const path = require("path")
const db = require("./db")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(express.static(path.join(__dirname, "public")))

// Inicializar la base de datos
app.get("/api/init", async (req, res) => {
  try {
    await db.initDatabase()
    res.json({ success: true, message: "Base de datos inicializada correctamente" })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    res.status(500).json({ success: false, error: "Error al inicializar la base de datos" })
  }
})

// Obtener todos los hosts
app.get("/api/hosts", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM failed_hosts 
      ORDER BY last_failure DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener hosts:", error)
    res.status(500).json({ error: "Error al obtener hosts" })
  }
})

// Agregar hosts
app.post("/api/hosts", async (req, res) => {
  try {
    const { hostnames, branch } = req.body

    if (!hostnames || !hostnames.length || !branch) {
      return res.status(400).json({ error: "Se requieren hostnames y filial" })
    }

    for (const hostname of hostnames) {
      // Generar una IP falsa para demostración
      const ipParts = hostname.match(/\d+/g)
      const ipSuffix = ipParts ? ipParts.join(".") : Math.floor(Math.random() * 255)
      const ipAddress = `192.168.1.${ipSuffix}`

      // Verificar si el host existe
      const existingHost = await db.query(`SELECT id FROM failed_hosts WHERE hostname = $1`, [hostname])

      if (existingHost.rows.length > 0) {
        // Actualizar host existente
        await db.query(
          `UPDATE failed_hosts 
           SET failure_count = failure_count + 1, 
               last_failure = NOW() 
           WHERE hostname = $1`,
          [hostname],
        )
      } else {
        // Insertar nuevo host
        await db.query(
          `INSERT INTO failed_hosts 
           (hostname, ip_address, branch, failure_count, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [hostname, ipAddress, branch],
        )
      }
    }

    res.json({ success: true, message: `Se agregaron ${hostnames.length} host(s) a la base de datos` })
  } catch (error) {
    console.error("Error al agregar hosts:", error)
    res.status(500).json({ error: "Error al agregar hosts" })
  }
})

// Conectar a un host
app.post("/api/connect", async (req, res) => {
  try {
    const { ip } = req.body

    if (!ip) {
      return res.status(400).json({ success: false, message: "Se requiere dirección IP" })
    }

    // Simulación de conexión con un retraso
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simular una tasa de éxito del 70% para demostración
    const isReachable = Math.random() > 0.3

    if (isReachable) {
      res.json({
        success: true,
        message: `Conexión exitosa a ${ip}`,
      })
    } else {
      res.json({
        success: false,
        message: `El host ${ip} no responde`,
      })
    }
  } catch (error) {
    console.error("Error al conectar con el host:", error)
    res.status(500).json({
      success: false,
      message: "Ocurrió un error al intentar conectar",
    })
  }
})

// Estadísticas por filial
app.get("/api/stats/branches", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        branch,
        SUM(failure_count) as count
      FROM 
        failed_hosts
      GROUP BY 
        branch
      ORDER BY 
        count DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener estadísticas de filiales:", error)
    res.status(500).json({ error: "Error al obtener estadísticas de filiales" })
  }
})

// Estadísticas por host
app.get("/api/stats/hosts", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        hostname,
        failure_count as count
      FROM 
        failed_hosts
      ORDER BY 
        failure_count DESC
      LIMIT 10
    `)

    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener estadísticas de hosts:", error)
    res.status(500).json({ error: "Error al obtener estadísticas de hosts" })
  }
})

// Ruta para servir la aplicación frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})
