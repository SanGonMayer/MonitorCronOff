export const dynamic = "force-dynamic";
export const runtime = 'nodejs';
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Importa dinámicamente la función initDatabase
    const { initDatabase } = await import("@/lib/db");
    await initDatabase();
    return NextResponse.json({ success: true, message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json({ success: false, error: "Failed to initialize database" }, { status: 500 });
  }
}
