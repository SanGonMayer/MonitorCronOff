// app/api/hosts/routes.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const result = await db.query(`
      SELECT
        id,
        hostname,
        ip_address        AS "ipAddress",
        branch,
        failure_count     AS "failureCount",
        prev_ssh_success  AS "prevSshSuccess",
        last_ssh_success  AS "lastSshSuccess",
        last_failure      AS "lastFailure"
      FROM failed_hosts
      ORDER BY last_failure DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching hosts:", error)
    return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 })
  }
}
