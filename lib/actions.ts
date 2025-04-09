"use server"

import { db } from "@/lib/db"

export async function addHosts(hostnames: string[], filial: string) {
  try {
    for (const hostname of hostnames) {
      // Generate a fake IP for demonstration - in real app, you'd look this up
      const ipParts = hostname.match(/\d+/g)
      const ipSuffix = ipParts ? ipParts.join(".") : Math.floor(Math.random() * 255)
      const ipAddress = `192.168.1.${ipSuffix}`

      // Check if host exists
      const existingHost = await db.query(`SELECT id FROM failed_hosts WHERE hostname = $1`, [hostname])

      if (existingHost.rows.length > 0) {
        // Update existing host
        await db.query(
          `UPDATE failed_hosts 
           SET times_submitted = times_submitted + 1, 
               last_failure = NOW() 
           WHERE hostname = $1`,
          [hostname],
        )
      } else {
        // Insert new host
        await db.query(
          `INSERT INTO failed_hosts 
           (hostname, ip_address, filial, times_submitted, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [hostname, ipAddress, filial],
        )
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding hosts:", error)
    throw new Error("Failed to add hosts")
  }
}

export async function connectToHost(ip: string) {
  try {
    // Instead of using child_process, we'll use fetch to simulate a connection check
    // In a real application, you would implement a proper server endpoint that uses SSH or other protocols

    // Simulate a network request with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    // We'll use a random success/failure for demonstration
    // In a real app, you'd have a proper API endpoint that checks connectivity
    const isReachable = Math.random() > 0.3 // 70% chance of success for demo purposes

    clearTimeout(timeoutId)

    if (isReachable) {
      return {
        success: true,
        message: `Successfully connected to ${ip}`,
      }
    } else {
      return {
        success: false,
        message: `Host ${ip} is not responding`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect to ${ip}. Host may be offline.`,
    }
  }
}
