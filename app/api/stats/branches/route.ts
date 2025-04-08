export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Importa dinámicamente el objeto db
    const { db } = await import("@/lib/db");

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
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching branch stats:", error);
    return NextResponse.json({ error: "Failed to fetch branch statistics" }, { status: 500 });
  }
}
