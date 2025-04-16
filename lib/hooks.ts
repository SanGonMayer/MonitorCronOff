"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// 1. Definimos la interfaz con todos los campos que devuelve /api/hosts
export interface Host {
  id: number
  hostname: string
  ipAddress: string
  branch: string
  failureCount: number
  prevSshSuccess: boolean
  lastSshSuccess: boolean
  lastFailure: string // o Date, según prefieras parsearlo
}

// 2. Usamos el genérico <Host[]> para que data sea de tipo Host[]
export function useHostData() {
  const { data, error, isLoading, mutate } = useSWR<Host[]>("/api/hosts", fetcher)

  return {
    // 3. hosts siempre será array, nunca undefined
    hosts: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useHostStats() {
  const { data: branchStats, isLoading: branchLoading } = useSWR("/api/stats/branches", fetcher)
  const { data: hostStats, isLoading: hostLoading } = useSWR("/api/stats/hosts", fetcher)

  return {
    branchStats: branchStats || [],
    hostStats: hostStats || [],
    isLoading: branchLoading || hostLoading,
  }
}
