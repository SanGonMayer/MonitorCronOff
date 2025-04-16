"use server"

import { db } from "@/lib/db"
import { parse } from "yaml"
import axios from "axios"
import { exec } from "child_process"
import { promisify } from "util"

const AWX_API_URL = "http://sawx0001lx.bancocredicoop.coop/api/v2"

const awxClient = axios.create({
  baseURL: AWX_API_URL,
  auth: {
    username: process.env.AWX_USER_API || "",
    password: process.env.AWX_PASS_API || "",
  },
  headers: {
    Accept: "application/json",
  },
})

async function getIpFromAWX(hostname: string): Promise<string | null> {
  try {
    const response = await awxClient.get(`/inventories/22/hosts/?name=${hostname}`)

    const results = response.data.results
    if (!results || results.length === 0) {
      console.warn(`Host ${hostname} no encontrado en AWX.`)
      return null
    }

    const variables = results[0].variables
    const parsed = parse(variables)

    return parsed.ansible_host || null
  } catch (error: any) {
    console.error(`Error al consultar AWX para ${hostname}:`, error.response?.data || error.message)
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

const execAsync = promisify(exec)

export async function connectToHostAndSave(hostname: string, ip: string) {
  const timeout = 3
  const user = "segmayer"
  const sshCommand = `ssh -o ConnectTimeout=${timeout} -o StrictHostKeyChecking=no -o BatchMode=yes ${user}@${ip} exit`

  console.log(`Ejecutando: ${sshCommand}`)

  // 1. Ejecutamos el SSH y determinamos éxito/fallo
  let lastSuccess = false
  try {
    const { stdout, stderr } = await execAsync(sshCommand)
    console.log("✔️ SSH SUCCESS", stdout, stderr)
    lastSuccess = true
  } catch (error: any) {
    const errOut = (error.stderr || "").toString()
    const out   = (error.stdout || "").toString()
    console.log("❌ SSH ERROR", errOut, out)

    // Si falla por auth pero responde, también lo consideramos "conectado"
    if (
      errOut.includes("Permission denied") ||
      errOut.includes("Authentication failed") ||
      out.includes("Solo las personas autorizadas")
    ) {
      lastSuccess = true
    }
  }

  // 2. Actualizamos la tabla failed_hosts
  const upd = await db.query(
    `UPDATE failed_hosts
       SET prev_ssh_success = last_ssh_success,
           last_ssh_success = $2
     WHERE hostname = $1
     RETURNING id`,
    [hostname, lastSuccess]
  )

  // 3. Si no existía, lo insertamos
  if (upd.rowCount === 0) {
    await db.query(
      `INSERT INTO failed_hosts
        (hostname, ip_address, prev_ssh_success, last_ssh_success, failure_count, last_failure)
       VALUES
        ($1, $2, FALSE, $3, 0, NOW())`,
      [hostname, ip, lastSuccess]
    )
  }

  // 4. Devolvemos el mensaje para el front
  if (lastSuccess) {
    return {
      success: true,
      message: `La IP ${ip} responde a SSH como ${user}.`
    }
  } else {
    return {
      success: false,
      message: `No se pudo conectar con ${ip} vía SSH (usuario ${user}).`
    }
  }
}