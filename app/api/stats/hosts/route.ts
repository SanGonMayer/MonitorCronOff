import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const dynamic = "force-dynamic";


export async function GET() {
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

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching host stats:", error)
    return NextResponse.json({ error: "Failed to fetch host statistics" }, { status: 500 })
  }
}
