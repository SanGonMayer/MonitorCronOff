import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HostMonitor from "@/components/host-monitor"
import ThemeToggle from "@/components/theme-toggle"
import BranchView from "@/components/branch-view"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-[#8A2BE2] to-[#9932CC] dark:from-[#4B0082] dark:to-[#663399] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Monitor CRN_OFF</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Tabs defaultValue="branch" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 rounded-full bg-muted/20 p-1">
            <TabsTrigger
              value="branch"
              className="rounded-full data-[state=active]:bg-[#8A2BE2] data-[state=active]:text-white dark:data-[state=active]:bg-[#4B0082]"
            >
              Filiales
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-full data-[state=active]:bg-[#8A2BE2] data-[state=active]:text-white dark:data-[state=active]:bg-[#4B0082]"
            >
              Estadísticas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="branch">
            <BranchView />
          </TabsContent>
          <TabsContent value="stats">
            <HostMonitor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
