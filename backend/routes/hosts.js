const express = require("express")
const router = express.Router()
const db = require("../db")

// Obtener todos los hosts
router.get("/", async (req, res) => {
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
router.post("/", async (req, res) => {
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

module.exports = router
