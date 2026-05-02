"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

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
    createPool: (maxMembers: number, destination: string) => Promise<string>
    joinPool: (poolId: string, member: PoolMember) => Promise<boolean>
    getPool: (poolId: string) => Pool | undefined
    openPools: Pool[]
    fullPools: Pool[]
    myJoinedPoolIds: string[]
    trackJoin: (poolId: string) => void
    loading: boolean
}

const PoolContext = createContext<PoolContextType | null>(null)

const POOL_SHIPPING: Record<string, number> = {
    EU: 25, US: 35, OTHER: 45
}

export function PoolProvider({ children }: { children: ReactNode }) {
    const [pools, setPools] = useState<Pool[]>([])
    const [myJoinedPoolIds, setMyJoinedPoolIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    // Giriş yapan kullanıcının ID'sini al
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setCurrentUserId(user.id)
        })
    }, [])

    // Veritabanından paketleri çek
    const fetchPools = async () => {
        const { data: poolsData, error } = await supabase
            .from('pools')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Paketler yüklenemedi:", error)
            setLoading(false)
            return
        }

        if (!poolsData) {
            setPools([])
            setLoading(false)
            return
        }

        // Her paket için üyelerini çek
        const fullPools: Pool[] = await Promise.all(
            poolsData.map(async (p: any) => {
                const { data: membersData } = await supabase
                    .from('pool_members')
                    .select('*')
                    .eq('pool_id', p.id)

                const members: PoolMember[] = (membersData || []).map((m: any) => ({
                    userId: m.user_id,
                    name: m.name,
                    items: m.items || []
                }))

                const memberCount = members.length || 1
                return {
                    id: p.id,
                    maxMembers: p.max_members,
                    members,
                    shippingCost: p.shipping_cost,
                    perPersonCost: p.shipping_cost / memberCount,
                    status: p.status,
                    destination: p.destination
                }
            })
        )

        setPools(fullPools)

        // Kullanıcının katıldığı paketleri hesapla (veritabanından)
        if (currentUserId) {
            const joinedIds = fullPools
                .filter(p => p.members.some(m => m.userId === currentUserId))
                .map(p => p.id)
            setMyJoinedPoolIds(joinedIds)
        }

        setLoading(false)
    }

    // Sayfa yüklendiğinde ve kullanıcı ID değiştiğinde paketleri çek
    useEffect(() => {
        fetchPools()

        // Realtime: paketler veya üyeler değişince otomatik güncelle
        const poolChannel = supabase
            .channel('pools-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pools' }, fetchPools)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pool_members' }, fetchPools)
            .subscribe()

        return () => {
            supabase.removeChannel(poolChannel)
        }
    }, [currentUserId])

    const trackJoin = (poolId: string) => {
        setMyJoinedPoolIds(prev => prev.includes(poolId) ? prev : [...prev, poolId])
    }

    const createPool = async (maxMembers: number, destination: string): Promise<string> => {
        const shippingCost = POOL_SHIPPING[destination] || 45

        const { data, error } = await supabase
            .from('pools')
            .insert({
                max_members: maxMembers,
                shipping_cost: shippingCost,
                status: 'open',
                destination
            })
            .select()
            .single()

        if (error || !data) {
            console.error("Paket oluşturulamadı:", error)
            alert("Paket oluşturulamadı: " + (error?.message || ""))
            return ""
        }

        await fetchPools()
        return data.id
    }

    const joinPool = async (poolId: string, member: PoolMember): Promise<boolean> => {
        // Kullanıcı ID'sini belirle: giriş yapmış kullanıcı varsa onu kullan
        const userId = currentUserId || member.userId

        // Önce veritabanında bu kullanıcı zaten bu pakete katılmış mı kontrol et
        const { data: existingMember } = await supabase
            .from('pool_members')
            .select('id')
            .eq('pool_id', poolId)
            .eq('user_id', userId)
            .maybeSingle()

        if (existingMember) {
            alert("Bu pakete zaten katıldınız!")
            return false
        }

        // Paketin durumunu kontrol et
        const pool = pools.find(p => p.id === poolId)
        if (!pool || pool.status !== 'open') return false

        // Üyeyi veritabanına ekle
        const { error } = await supabase
            .from('pool_members')
            .insert({
                pool_id: poolId,
                user_id: userId,
                name: member.name,
                items: member.items
            })

        if (error) {
            console.error("Pakete katılınamadı:", error)
            return false
        }

        // Paket doldu mu kontrol et
        const newMemberCount = pool.members.length + 1
        if (newMemberCount >= pool.maxMembers) {
            await supabase
                .from('pools')
                .update({ status: 'full' })
                .eq('id', poolId)
        }

        await fetchPools()
        return true
    }

    const getPool = (poolId: string) => pools.find(p => p.id === poolId)
    const openPools = pools.filter(p => p.status === "open")
    const fullPools = pools.filter(p => p.status === "full")

    return (
        <PoolContext.Provider value={{ pools, createPool, joinPool, getPool, openPools, fullPools, myJoinedPoolIds, trackJoin, loading }}>
            {children}
        </PoolContext.Provider>
    )
}

export const usePool = () => {
    const ctx = useContext(PoolContext)
    if (!ctx) throw new Error("usePool must be used within PoolProvider")
    return ctx
}

