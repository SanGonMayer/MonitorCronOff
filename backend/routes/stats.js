const express = require("express")
const router = express.Router()
const db = require("../db")

// Estadísticas por filial
router.get("/branches", async (req, res) => {
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
router.get("/hosts", async (req, res) => {
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

module.exports = router
