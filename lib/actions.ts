"use server"
import FailedHost from '../models/FailedHost';
import fetch from "node-fetch"; // Asegúrate de tener un polyfill o usar fetch nativo si está disponible


export async function addHosts(hostnames: string[], filial: number) {
  try {
    for (const hostname of hostnames) {
      // Consulta el endpoint de AWX para obtener la IP real del host
      const ipAddress = await fetchIPForHost(hostname) || `192.168.1.${Math.floor(Math.random() * 255)}`;
      
      // Verificamos si ya existe el host (usando el modelo o la consulta tradicional)
      const existingHost = await db.query(`SELECT id FROM failed_hosts WHERE hostname = $1`, [hostname]);

      if (existingHost.rows.length > 0) {
        // Actualización: incrementa el contador y actualiza la IP
        await db.query(
          `UPDATE failed_hosts 
           SET failure_count = failure_count + 1,
               ip_address = $2,
               last_failure = NOW() 
           WHERE hostname = $1`,
          [hostname, ipAddress],
        );
      } else {
        // Inserción: crea el nuevo registro
        await db.query(
          `INSERT INTO failed_hosts 
           (hostname, ip_address, branch, failure_count, last_failure) 
           VALUES ($1, $2, $3, 1, NOW())`,
          [hostname, ipAddress, filial],
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding hosts:", error);
    throw new Error("Failed to add hosts");
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

const BASE_URL = "https://sawx0001lx.bancocredicoop.coop/api/v2/inventories/22/hosts/?name__startswith=";

async function fetchIPForHost(hostname: string): Promise<string> {
  try {
    // Concatena el hostname completo para la consulta
    const response = await fetch(`${BASE_URL}${hostname}`);
    const data = await response.json();

    // Asegúrate de que data tenga resultados, por ejemplo, asumiendo que está en data.results
    if (data && Array.isArray(data.results) && data.results.length > 0) {
      const hostData = data.results[0];

      // El campo "variables" es un string en formato JSON
      if (hostData.variables) {
        let variablesObj;
        try {
          variablesObj = JSON.parse(hostData.variables);
        } catch (parseError) {
          console.error("Error al parsear el campo variables para el host:", hostname, parseError);
          return "";
        }
        // Retorna el valor de 'ansible_host' que contiene la IP
        return variablesObj.ansible_host || "";
      }
    }
  } catch (error) {
    console.error(`Error al obtener la IP para ${hostname}:`, error);
  }
  // Si falla la consulta o no se encuentra la IP, se puede retornar cadena vacía o un valor por defecto
  return "";
}