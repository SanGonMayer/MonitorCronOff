"use client";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then((res) => res.json());
export function useHostData() {
    const { data, error, isLoading, mutate } = useSWR("/api/hosts", fetcher);
    return {
        hosts: data,
        isLoading,
        isError: error,
        mutate,
    };
}
export function useHostStats() {
    const { data: branchStats, isLoading: branchLoading } = useSWR("/api/stats/branches", fetcher);
    const { data: hostStats, isLoading: hostLoading } = useSWR("/api/stats/hosts", fetcher);
    return {
        branchStats: branchStats || [],
        hostStats: hostStats || [],
        isLoading: branchLoading || hostLoading,
    };
}
