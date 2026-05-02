"use client"
import { createContext, useContext, useState, ReactNode } from "react"

interface PoolMember {
    userId: string
    name: string
    items: { name: string; price: number }[]
}

interface Pool {
    id: string
    maxMembers: number
    members: PoolMember[]
    shippingCost: number
    perPersonCost: number
    status: "open" | "full" | "shipped"
    destination: string
}

interface PoolContextType {
    pools: Pool[]
    createPool: (maxMembers: number, destination: string) => string
    joinPool: (poolId: string, member: PoolMember) => boolean
    getPool: (poolId: string) => Pool | undefined
    openPools: Pool[]
    fullPools: Pool[]
    myJoinedPoolIds: string[]          // ← EKLE
    trackJoin: (poolId: string) => void // ← EKLE
}


const PoolContext = createContext<PoolContextType | null>(null)

const POOL_SHIPPING: Record<string, number> = {
    EU: 25, US: 35, OTHER: 45
}

export function PoolProvider({ children }: { children: ReactNode }) {
    const [pools, setPools] = useState<Pool[]>([])

    const [myJoinedPoolIds, setMyJoinedPoolIds] = useState<string[]>([])

    const trackJoin = (poolId: string) => {
        setMyJoinedPoolIds(prev => prev.includes(poolId) ? prev : [...prev, poolId])
    }

    const createPool = (maxMembers: number, destination: string) => {
        const id = `pool-${Date.now()}`
        const shippingCost = POOL_SHIPPING[destination] || 45
        const newPool: Pool = {
            id, maxMembers, members: [],
            shippingCost,
            perPersonCost: shippingCost / maxMembers,
            status: "open",
            destination
        }
        setPools(prev => [...prev, newPool])
        return id
    }

    const joinPool = (poolId: string, member: PoolMember) => {
        let success = false
        setPools(prev => prev.map(p => {
            if (p.id !== poolId || p.status !== "open") return p

            // Aynı isimle tekrar katılım engeli
            const alreadyJoined = p.members.some(
                m => m.name.toLowerCase().trim() === member.name.toLowerCase().trim()
            )
            if (alreadyJoined) return p

            const updated = { ...p, members: [...p.members, member] }
            if (updated.members.length >= p.maxMembers) {
                updated.status = "full"
            }
            updated.perPersonCost = p.shippingCost / updated.members.length
            success = true
            return updated
        }))
        return success
    }

    const getPool = (poolId: string) => pools.find(p => p.id === poolId)
    const openPools = pools.filter(p => p.status === "open")
    const fullPools = pools.filter(p => p.status === "full")

    return (
        <PoolContext.Provider value={{ pools, createPool, joinPool, getPool, openPools, fullPools, myJoinedPoolIds, trackJoin }}>

            {children}
        </PoolContext.Provider>
    )
}

export const usePool = () => {
    const ctx = useContext(PoolContext)
    if (!ctx) throw new Error("usePool must be used within PoolProvider")
    return ctx
}
