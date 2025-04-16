"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { addHosts } from "@/lib/actions"
import { useHostData } from "@/lib/hooks"
import { Loader2, Plus, Terminal, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function BranchView() {
  const [branchNumber, setBranchNumber] = useState("")
  const [hostInput, setHostInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { hosts, isLoading, mutate } = useHostData()

  const handleAddHostsByBranch = async () => {
    /* ...igual que antes... */
  }

  const handleConnect = async (hostname: string, ipAddress: string) => {
     setConnecting(hostname)
     try {
       const res = await fetch("/api/ssh", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ hostname, ip: ipAddress }),
       })
       const result = await res.json()

       toast({
         title: result.success ? "Conexión Exitosa" : "Conexión Fallida",
         description: result.message,
         variant: result.success ? "default" : "destructive",
       })

       // Refresca los datos para pintar prevSshSuccess / lastSshSuccess
       mutate()
     } catch {
       toast({
         title: "Error",
         description: "No se pudo contactar al servidor",
         variant: "destructive",
       })
     } finally {
       setConnecting(null)
     }
   }

  const filteredHosts = hosts?.filter(
    (host) =>
      host.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.branch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid gap-8">
      {/* ...Tarjeta de Agregar Hosts igual... */}

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-[#FF8C00] to-[#FF7F00] dark:from-[#E65100] dark:to-[#EF6C00] p-4 text-white">
          <h2 className="text-xl font-semibold">Hosts Fallidos</h2>
          <p className="text-sm opacity-90">
            Hosts que fallaron en la ejecución de la plantilla CRN_OFF
          </p>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {/* Buscador igual... */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#8A2BE2]" />
              </div>
            ) : filteredHosts && filteredHosts.length > 0 ? (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hostname</TableHead>
                      <TableHead>Dirección IP</TableHead>
                      <TableHead>Filial</TableHead>
                      <TableHead>Fallos</TableHead>
                      <TableHead className="text-center">
                        Conexión Anterior
                      </TableHead>
                      <TableHead className="text-center">
                        Conexión Actual
                      </TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHosts.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell className="font-medium">
                          {host.hostname}
                        </TableCell>
                        <TableCell>{host.ipAddress}</TableCell>
                        <TableCell>Filial {host.branch}</TableCell>
                        <TableCell>{host.failureCount}</TableCell>

                        {/* Columna Conexión Anterior */}
                        <TableCell
                          className={`text-center ${
                            host.prevSshSuccess
                              ? "bg-green-200"
                              : "bg-red-200"
                          }`}
                        >
                          {host.prevSshSuccess ? "OK" : "FAIL"}
                        </TableCell>

                        {/* Columna Conexión Actual */}
                        <TableCell
                          className={`text-center ${
                            host.lastSshSuccess
                              ? "bg-green-200"
                              : "bg-red-200"
                          }`}
                        >
                          {host.lastSshSuccess ? "OK" : "FAIL"}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 rounded-xl"
                            onClick={() =>
                              handleConnect(host.hostname, host.ipAddress)
                            }
                            disabled={connecting === host.hostname}
                          >
                            {connecting === host.hostname ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Terminal className="h-4 w-4" />
                            )}
                            Conectar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl">
                No se encontraron hosts fallidos. Agregue algunos hosts para
                comenzar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
