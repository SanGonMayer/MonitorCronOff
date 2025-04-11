"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useHostStats } from "@/lib/hooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, } from "recharts";
export default function HostMonitor() {
    const { branchStats, hostStats, isLoading } = useHostStats();
    const COLORS = ["#8A2BE2", "#9932CC", "#FF8C00", "#FF7F00", "#FF6347"];
    if (isLoading) {
        return (<div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A2BE2]"/>
      </div>);
    }
    // Sort stats from highest to lowest
    const sortedBranchStats = [...(branchStats || [])].sort((a, b) => b.count - a.count);
    const sortedHostStats = [...(hostStats || [])].sort((a, b) => b.count - a.count);
    return (<div className="grid gap-6 md:grid-cols-2">
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-[#8A2BE2] to-[#9932CC] dark:from-[#4B0082] dark:to-[#663399] p-4 text-white">
          <h2 className="text-xl font-semibold">Filiales con Más Fallos</h2>
        </div>
        <CardContent className="pt-6">
          {sortedBranchStats.length > 0 ? (<div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedBranchStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="branch" name="Filial" tickFormatter={(value) => `Filial ${value}`}/>
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `Filial ${value}`}/>
                  <Bar dataKey="count" name="Cantidad de Fallos" fill="#8A2BE2" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>) : (<div className="flex justify-center items-center h-[300px] text-muted-foreground">
              No hay datos disponibles
            </div>)}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-[#8A2BE2] to-[#9932CC] dark:from-[#4B0082] dark:to-[#663399] p-4 text-white">
          <h2 className="text-xl font-semibold">Hosts con Más Fallos</h2>
        </div>
        <CardContent className="pt-6">
          {sortedHostStats.length > 0 ? (<div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sortedHostStats.slice(0, 5)} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="count" nameKey="hostname">
                    {sortedHostStats.slice(0, 5).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} fallos`, "Cantidad"]}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>) : (<div className="flex justify-center items-center h-[300px] text-muted-foreground">
              No hay datos disponibles
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
