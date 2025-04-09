"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { addHosts, connectToHost } from "@/lib/actions"
import { useHostData } from "@/lib/hooks"
import { Loader2, Plus, Terminal, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BranchView() {
  const [branchNumber, setBranchNumber] = useState("")
  const [hostInput, setHostInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { hosts, isLoading, mutate } = useHostData()

  const handleAddHostsByBranch = async () => {
    if (!branchNumber) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número de filial",
        variant: "destructive",
      })
      return
    }

    const branchNum = Number.parseInt(branchNumber)
    if (isNaN(branchNum) || branchNum < 1 || branchNum > 999) {
      toast({
        title: "Error",
        description: "El número de filial debe estar entre 1 y 999",
        variant: "destructive",
      })
      return
    }

    if (!hostInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese al menos un host",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const hostList = hostInput
        .split(/[\n,]/)
        .map((h) => h.trim())
        .filter((h) => h.length > 0)

      await addHosts(hostList, branchNumber.toString())
      setHostInput("")
      mutate()

      toast({
        title: "Éxito",
        description: `Se agregaron ${hostList.length} host(s) a la filial ${branchNumber}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al agregar hosts",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnect = async (hostname: string, ip: string) => {
    setConnecting(hostname)
    try {
      const result = await connectToHost(ip)
      toast({
        title: result.success ? "Conexión Exitosa" : "Conexión Fallida",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al conectar con el host",
        variant: "destructive",
      })
    } finally {
      setConnecting(null)
    }
  }

  const filteredHosts = hosts?.filter(
    (host) =>
      host.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.branch.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid gap-8">
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-[#8A2BE2] to-[#9932CC] dark:from-[#4B0082] dark:to-[#663399] p-4 text-white">
          <h2 className="text-xl font-semibold">Agregar Hosts por Filial</h2>
          <p className="text-sm opacity-90">Ingrese el número de filial y los hosts asociados a ella</p>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="branch-number">Número de Filial (1-999)</Label>
              <Input
                id="branch-number"
                type="number"
                min="1"
                max="999"
                placeholder="Ej: 42"
                value={branchNumber}
                onChange={(e) => setBranchNumber(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hosts">Hosts de la Filial</Label>
              <Textarea
                id="hosts"
                placeholder="Ingrese nombres de host (uno por línea o separados por comas)"
                value={hostInput}
                onChange={(e) => setHostInput(e.target.value)}
                className="min-h-[150px] rounded-xl"
              />
            </div>

            <Button
              className="bg-gradient-to-r from-[#8A2BE2] to-[#9932CC] hover:from-[#7B1FA2] hover:to-[#8E24AA] text-white rounded-xl flex gap-2 items-center w-full sm:w-auto justify-center"
              onClick={handleAddHostsByBranch}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Agregar Hosts a la Filial
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-[#FF8C00] to-[#FF7F00] dark:from-[#E65100] dark:to-[#EF6C00] p-4 text-white">
          <h2 className="text-xl font-semibold">Hosts Fallidos</h2>
          <p className="text-sm opacity-90">Hosts que fallaron en la ejecución de la plantilla CRN_OFF</p>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar hosts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

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
                      <TableHead>Contador de Fallos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHosts.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell className="font-medium">{host.hostname}</TableCell>
                        <TableCell>{host.ip_address}</TableCell>
                        <TableCell>Filial {host.branch}</TableCell>
                        <TableCell>{host.failure_count}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 rounded-xl"
                            onClick={() => handleConnect(host.hostname, host.ip_address)}
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
                No se encontraron hosts fallidos. Agregue algunos hosts para comenzar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
