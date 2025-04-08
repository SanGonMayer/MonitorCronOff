import { NextResponse } from "next/server";
import FailedHost from "@/models/FailedHost";
export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const hosts = await FailedHost.findAll({
      order: [['last_failure', 'DESC']]
    });

    return NextResponse.json(hosts);
  } catch (error) {
    console.error("Error fetching hosts:", error);
    return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 });
  }
}