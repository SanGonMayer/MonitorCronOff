import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        filial,
        SUM(failure_count) as count
      FROM 
        failed_hosts
      GROUP BY 
        filial
      ORDER BY 
        count DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching filial stats:", error)
    return NextResponse.json({ error: "Failed to fetch filial statistics" }, { status: 500 })
  }
}
