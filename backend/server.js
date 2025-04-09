const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const path = require("path")
const db = require("./db")
const hostsRoutes = require("./routes/hosts")
const statsRoutes = require("./routes/stats")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, "../frontend")))

// Rutas API
app.use("/api/hosts", hostsRoutes)
app.use("/api/stats", statsRoutes)

// Inicializar la base de datos
app.get("/api/init", async (req, res) => {
  try {
    await db.initDatabase()
    res.json({ success: true, message: "Base de datos inicializada correctamente" })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    res.status(500).json({ success: false, error: "Error al inicializar la base de datos", details: error.message })
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
      details: error.message,
    })
  }
})

// Ruta para verificar el estado de la API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Ruta para servir la aplicación frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`
  ┌────────────────────────────────────────────────┐
  │                                                │
  │   Servidor ejecutándose en:                    │
  │   http://localhost:${PORT}                       │
  │                                                │
  │   API Health Check:                            │
  │   http://localhost:${PORT}/api/health            │
  │                                                │
  └────────────────────────────────────────────────┘
  `)
})
