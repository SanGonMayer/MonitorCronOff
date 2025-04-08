export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Importa el modelo de forma dinámica en tiempo de petición
    const { default: FailedHost } = await import("@/models/FailedHost");
    const hosts = await FailedHost.findAll({
      order: [['last_failure', 'DESC']]
    });
    return NextResponse.json(hosts);
  } catch (error) {
    console.error("Error fetching hosts:", error);
    return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 });
  }
}
