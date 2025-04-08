export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Importa dinámicamente el objeto db
    const { db } = await import("@/lib/db");

    const result = await db.query(`
      SELECT 
        hostname,
        failure_count as count
      FROM 
        failed_hosts
      ORDER BY 
        failure_count DESC
      LIMIT 10
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching host stats:", error);
    return NextResponse.json({ error: "Failed to fetch host statistics" }, { status: 500 });
  }
}
