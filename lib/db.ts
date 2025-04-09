// In-memory database for demonstration purposes
class InMemoryDB {
  private hosts: any[] = []
  private idCounter = 1

  async query(text: string, params?: any[]) {
    // Simple query parser to handle basic operations
    if (text.includes("CREATE TABLE")) {
      // Simulate table creation
      return { rows: [] }
    } else if (text.includes("SELECT * FROM failed_hosts")) {
      // Return all hosts
      return { rows: this.hosts }
    } else if (text.includes("SELECT id FROM failed_hosts WHERE hostname =")) {
      // Check if host exists
      const hostname = params?.[0]
      const existingHost = this.hosts.find((h) => h.hostname === hostname)
      return { rows: existingHost ? [existingHost] : [] }
    } else if (text.includes("UPDATE failed_hosts")) {
      // Update host
      const hostname = params?.[0]
      const hostIndex = this.hosts.findIndex((h) => h.hostname === hostname)
      if (hostIndex !== -1) {
        this.hosts[hostIndex].failure_count += 1
        this.hosts[hostIndex].last_failure = new Date()
      }
      return { rows: [] }
    } else if (text.includes("INSERT INTO failed_hosts")) {
      // Insert new host
      const [hostname, ipAddress, branch] = params || []
      const newHost = {
        id: this.idCounter++,
        hostname,
        ip_address: ipAddress,
        branch,
        failure_count: 1,
        last_failure: new Date(),
        created_at: new Date(),
      }
      this.hosts.push(newHost)
      return { rows: [newHost] }
    } else if (text.includes("SELECT branch, SUM(failure_count)")) {
      // Get branch statistics
      const branchStats = this.hosts.reduce((acc: any, host) => {
        if (!acc[host.branch]) {
          acc[host.branch] = 0
        }
        acc[host.branch] += host.failure_count
        return acc
      }, {})

      return {
        rows: Object.entries(branchStats).map(([branch, count]) => ({
          branch,
          count,
        })),
      }
    } else if (text.includes("SELECT hostname, failure_count")) {
      // Get host statistics
      return {
        rows: [...this.hosts]
          .sort((a, b) => b.failure_count - a.failure_count)
          .slice(0, 10)
          .map((host) => ({
            hostname: host.hostname,
            count: host.failure_count,
          })),
      }
    }

    return { rows: [] }
  }
}

// Create an in-memory database instance
export const db = new InMemoryDB()

// Initialize the database
export async function initDatabase() {
  try {
    // Create the failed_hosts table (simulated)
    await db.query(`
      CREATE TABLE IF NOT EXISTS failed_hosts (
        id SERIAL PRIMARY KEY,
        hostname VARCHAR(255) NOT NULL,
        ip_address VARCHAR(15) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        failure_count INTEGER DEFAULT 1,
        last_failure TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Add some sample data for demonstration
    const sampleHosts = [
      { hostname: "HOST001", branch: "1" },
      { hostname: "HOST002", branch: "1" },
      { hostname: "HOST003", branch: "2" },
      { hostname: "HOST004", branch: "3" },
      { hostname: "HOST005", branch: "5" },
      { hostname: "HOST006", branch: "8" },
      { hostname: "HOST007", branch: "13" },
      { hostname: "HOST008", branch: "21" },
      { hostname: "HOST009", branch: "34" },
      { hostname: "HOST010", branch: "55" },
    ]

    for (const host of sampleHosts) {
      const ipParts = host.hostname.match(/\d+/g)
      const ipSuffix = ipParts ? ipParts.join(".") : Math.floor(Math.random() * 255)
      const ipAddress = `192.168.1.${ipSuffix}`

      await db.query(
        `INSERT INTO failed_hosts (hostname, ip_address, branch, failure_count, last_failure) 
         VALUES ($1, $2, $3, 1, NOW())`,
        [host.hostname, ipAddress, host.branch],
      )
    }

    console.log("Database initialized successfully with sample data")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}
