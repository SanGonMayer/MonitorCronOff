"use server"

import { db } from "@/lib/db"
import { parse } from "yaml"

const AWX_API_BASE = "http://sawx0001lx.bancocredicoop.coop/api/v2/inventories/22/hosts/?name="
const AWX_USERNAME = process.env.AWX_USERNAME || ""
const AWX_PASSWORD = process.env.AWX_PASSWORD || ""

async function getIpFromAWX(hostname: string): Promise<string | null> {
  const url = `${AWX_API_BASE}${hostname}`
  const authHeader = `Basic ${Buffer.from(`${AWX_USERNAME}:${AWX_PASSWORD}`).toString("base64")}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`AWX API error for ${hostname}: ${response.statusText}`)
      return null
    }

    const data = await response.json()
    const results = data.results

    if (!results || results.length === 0) {
      console.warn(`Host ${hostname} not found in AWX`)
      return null
    }

    const variables = results[0].variables
    const parsed = parse(variables)

    return parsed.ansible_host || null
  } catch (err) {
    console.error(`Error contacting AWX for ${hostname}:`, err)
    return null
  }
}

export async function addHosts(hostnames: string[], branch: string) {
  try {
    for (const hostname of hostnames) {
      const ipAddress = await getIpFromAWX(hostname)

      if (!ipAddress) {
        console.warn(`Skipping host ${hostname}: no IP found in AWX`)
        continue
      }

      const existingHost = await db.query(`SELECT id FROM failed_hosts WHERE hostname = $1`, [hostname])

      if (existingHost.rows.length > 0) {
        await db.query(
          `UPDATE failed_hosts 
           SET failure_count = failure_count + 1,
               ip_address = $2,
               last_failure = NOW() 
           WHERE hostname = $1`,
          [hostname, ipAddress],
        )
      } else {
        await db.query(
          `INSERT INTO failed_hosts 
           (hostname, ip_address, branch, failure_count, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [hostname, ipAddress, branch],
        )
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding hosts:", error)
    throw new Error("Failed to add hosts")
  }
}
