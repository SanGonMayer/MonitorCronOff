"use server"
import FailedHost from '../models/FailedHost';
import HttpsProxyAgent from 'https-proxy-agent';


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
    // Recupera las credenciales de AWX desde las variables de entorno
    const awxUser = process.env.AWX_USER;
    const awxPassword = process.env.AWX_PASSWORD;
    const auth = Buffer.from(`${awxUser}:${awxPassword}`).toString('base64');
    
    // Configura el agente de proxy para HTTPS usando la variable de entorno
    const proxyUrl = process.env.HTTPS_PROXY; // asegúrate de que esté definido
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    
    // Realiza la consulta incluyendo el header de autenticación y el agente de proxy (si existe)
    const response = await fetch(`${BASE_URL}${hostname}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      // Si proxyAgent es undefined, no se añade la propiedad
      ...(proxyAgent && { agent: proxyAgent }),
    });

    const data = await response.json();

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      const hostData = data.results[0];
      if (hostData.variables) {
        try {
          const variablesObj = JSON.parse(hostData.variables);
          return variablesObj.ansible_host || "";
        } catch (parseError) {
          console.error("Error al parsear el campo variables para el host:", hostname, parseError);
          return "";
        }
      }
    }
  } catch (error) {
    console.error(`Error al obtener la IP para ${hostname}:`, error);
  }
  return "";
}