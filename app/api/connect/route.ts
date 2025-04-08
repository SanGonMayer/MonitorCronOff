export const dynamic = "force-dynamic";
export const runtime = 'nodejs';
export const revalidate = 0;
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { ip } = await request.json()

    if (!ip) {
      return NextResponse.json({ success: false, message: "IP address is required" }, { status: 400 })
    }

    // In a real application, you would use a proper library here to check connectivity
    // For example, you could use the 'net' module to try to establish a TCP connection
    // or use a library like 'ssh2' to attempt an SSH connection

    // For demonstration purposes, we'll simulate a connection check with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate a 70% success rate for demonstration
    const isReachable = Math.random() > 0.3

    if (isReachable) {
      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${ip}`,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Host ${ip} is not responding`,
      })
    }
  } catch (error) {
    console.error("Error connecting to host:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while trying to connect",
      },
      { status: 500 },
    )
  }
}
