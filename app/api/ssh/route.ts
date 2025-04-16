import { NextResponse } from "next/server"
import { connectToHostAndSave } from "@/lib/actions"  // la función que hace execAsync + BD

export async function POST(req: Request) {
  const { hostname, ip } = await req.json()

  try {
    const result = await connectToHostAndSave(hostname, ip)
    return NextResponse.json(
      { success: result.success, message: result.message },
      { status: 200 }
    )
  } catch (err) {
    console.error("SSH API Error:", err)
    return NextResponse.json(
      { success: false, message: "Error interno al ejecutar SSH" },
      { status: 500 }
    )
  }
}
