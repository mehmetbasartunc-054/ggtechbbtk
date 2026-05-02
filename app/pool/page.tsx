"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Package2, Users, Plus, LogIn, CheckCircle, Truck } from "lucide-react"
import { usePool } from "@/contexts/PoolContext"
import { useCart } from "@/contexts/CartContext"

const DESTINATIONS = [
    { value: "EU", label: "Avrupa", price: 20 },
    { value: "US", label: "Amerika", price: 30 },
    { value: "OTHER", label: "Diğer", price: 40 },
]


export default function PoolPage() {
    const { openPools, fullPools, createPool, joinPool, myJoinedPoolIds, trackJoin } = usePool()

    const { items } = useCart()

    // Paket oluşturma
    const [createName, setCreateName] = useState("")
    const [maxMembers, setMaxMembers] = useState(3)
    const [destination, setDestination] = useState("EU")
    const [createdPoolId, setCreatedPoolId] = useState<string | null>(null)

    // Pakete katılma — her paket için ayrı isim state'i
    const [joinNames, setJoinNames] = useState<Record<string, string>>({})
    const [joinedPools, setJoinedPools] = useState<Set<string>>(new Set())
    const [joinErrors, setJoinErrors] = useState<Record<string, string>>({})

    const handleCreate = () => {
        if (!createName.trim()) return alert("İsminizi girin")
        if (items.length === 0) return alert("Paket oluşturmak için önce sepete ürün ekleyin")

        const id = createPool(maxMembers, destination)
        const cartItems = items.map(i => ({ name: i.name, price: i.price * i.quantity }))
        joinPool(id, { userId: `user-${Date.now()}`, name: createName, items: cartItems })
        trackJoin(id)
        setJoinedPools(prev => new Set([...prev, id]))

        setCreatedPoolId(id)
    }

    const handleJoin = (poolId: string) => {
        const name = joinNames[poolId]?.trim()
        if (!name) return alert("İsminizi girin")
        if (items.length === 0) return alert("Pakete katılmak için önce sepete ürün ekleyin")

        const pool = openPools.find(p => p.id === poolId)
        const alreadyIn = pool?.members.some(
            m => m.name.toLowerCase() === name.toLowerCase()
        )
        if (alreadyIn) {
            setJoinErrors(prev => ({ ...prev, [poolId]: "Bu isimle zaten pakete katılınmış." }))
            return
        }

        const cartItems = items.map(i => ({ name: i.name, price: i.price * i.quantity }))
        const success = joinPool(poolId, { userId: `user-${Date.now()}`, name, items: cartItems })
        trackJoin(poolId)
        setJoinedPools(prev => new Set([...prev, poolId]))
        setJoinErrors(prev => ({ ...prev, [poolId]: "" }))


        if (success) {
            setJoinedPools(prev => new Set([...prev, poolId]))
            setJoinErrors(prev => ({ ...prev, [poolId]: "" }))
        } else {
            setJoinErrors(prev => ({ ...prev, [poolId]: "Paket dolu veya bir hata oluştu." }))
        }
    }

    return (
        <div className="relative min-h-screen bg-[oklch(0.06_0.015_280)] overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-[oklch(0.65_0.25_295)] rounded-full blur-[200px] opacity-10" />
                <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] bg-[oklch(0.45_0.3_280)] rounded-full blur-[200px] opacity-10" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto pt-24 pb-20 px-6">
                <Link href="/" className="flex items-center gap-2 text-[oklch(0.55_0_0)] hover:text-white transition-colors mb-8 text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Ana Sayfaya Dön
                </Link>

                <h1 className="text-4xl font-bold text-white mb-2">Grup Kargo Paketleri</h1>
                <p className="text-[oklch(0.55_0_0)] mb-10">
                    Arkadaşlarınla aynı pakette sipariş ver — tek kargo ücreti üyelere bölünür.
                </p>

                {/* Sepetteki ürünler özeti */}
                {items.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-[oklch(0.12_0.02_280_/_0.5)] border border-[oklch(0.65_0.25_295_/_0.3)]">
                        <p className="text-[oklch(0.65_0.25_295)] text-sm font-semibold mb-2">Sepetindeki ürünler pakete eklenecek:</p>
                        <div className="flex flex-wrap gap-2">
                            {items.map(item => (
                                <span key={item.id} className="px-3 py-1 rounded-full bg-[oklch(0.65_0.25_295_/_0.15)] text-white text-xs">
                                    {item.name} x{item.quantity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {items.length === 0 && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm font-semibold">
                            Paket oluşturmak veya katılmak için önce ana sayfadan sepetine ürün ekle.
                        </p>
                        <Link href="/" className="text-[oklch(0.65_0.25_295)] text-sm hover:underline mt-1 inline-block">
                            → Alışverişe Git
                        </Link>
                    </div>
                )}


                {/* PAKET OLUŞTUR */}
                <section className="p-8 rounded-3xl bg-[oklch(0.15_0.02_280_/_0.3)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] mb-8">
                    <div className="flex items-center gap-3 border-b border-[oklch(0.25_0.03_280_/_0.5)] pb-4 mb-6">
                        <Package2 className="w-5 h-5 text-[oklch(0.65_0.25_295)]" />
                        <h2 className="text-xl font-bold text-white">Yeni Paket Oluştur</h2>
                    </div>

                    {createdPoolId ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                            <p className="text-white font-semibold text-lg">Paket Oluşturuldu!</p>
                            <p className="text-[oklch(0.55_0_0)] text-sm">Paket Kodu:</p>
                            <code className="px-4 py-2 rounded-xl bg-[oklch(0.1_0.01_280)] text-[oklch(0.65_0.25_295)] font-mono text-sm border border-[oklch(0.25_0.03_280)]">
                                {createdPoolId}
                            </code>
                            <p className="text-[oklch(0.55_0_0)] text-xs text-center">Bu kodu arkadaşlarınla paylaş</p>
                            <button onClick={() => { setCreatedPoolId(null); setCreateName("") }} className="mt-2 text-sm text-[oklch(0.65_0.25_295)] hover:underline">
                                Yeni Paket Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Adınız"
                                value={createName}
                                onChange={e => setCreateName(e.target.value)}
                                className="h-12 px-4 rounded-xl bg-[oklch(0.1_0.01_280_/_0.4)] border border-[oklch(0.2_0.02_280_/_0.5)] text-white outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] placeholder:text-[oklch(0.4_0_0)]"
                            />
                            <select
                                value={maxMembers}
                                onChange={e => setMaxMembers(Number(e.target.value))}
                                className="h-12 px-4 rounded-xl bg-[oklch(0.1_0.01_280)] border border-[oklch(0.2_0.02_280)] text-white outline-none"
                            >
                                {[2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{n} Kişilik Paket</option>
                                ))}
                            </select>
                            <select
                                value={destination}
                                onChange={e => setDestination(e.target.value)}
                                className="h-12 px-4 rounded-xl bg-[oklch(0.1_0.01_280)] border border-[oklch(0.2_0.02_280)] text-white outline-none"
                            >
                                {DESTINATIONS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label} (${d.price})</option>
                                ))}
                            </select>
                            {/* Tasarruf hesabı */}
                            {(() => {
                                const fullPrice = DESTINATIONS.find(d => d.value === destination)?.price ?? 0
                                const perPerson = fullPrice / maxMembers
                                const saving = fullPrice - perPerson
                                return (
                                    <div className="md:col-span-3 p-4 rounded-xl bg-[oklch(0.1_0.01_280)] border border-emerald-500/30 grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-[oklch(0.45_0_0)] text-xs mb-1">Normal Kargo</p>
                                            <p className="text-white font-bold">${fullPrice}</p>
                                        </div>
                                        <div>
                                            <p className="text-[oklch(0.45_0_0)] text-xs mb-1">Senin Payın</p>
                                            <p className="text-[oklch(0.65_0.25_295)] font-bold">${perPerson.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[oklch(0.45_0_0)] text-xs mb-1">Kazancın</p>
                                            <p className="text-emerald-400 font-bold">${saving.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )
                            })()}

                            <button
                                onClick={handleCreate}
                                disabled={items.length === 0}

                                className="md:col-span-3 h-12 bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Paket Oluştur ve Ürünlerimi Ekle
                            </button>
                        </div>
                    )}
                </section>

                {/* AÇIK PAKETLER */}
                <section className="p-8 rounded-3xl bg-[oklch(0.15_0.02_280_/_0.3)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] mb-8">
                    <div className="flex items-center gap-3 border-b border-[oklch(0.25_0.03_280_/_0.5)] pb-4 mb-6">
                        <Users className="w-5 h-5 text-[oklch(0.65_0.25_295)]" />
                        <h2 className="text-xl font-bold text-white">Açık Paketler</h2>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-[oklch(0.65_0.25_295_/_0.2)] text-[oklch(0.65_0.25_295)] text-xs font-bold">
                            {openPools.length} açık
                        </span>
                    </div>

                    {openPools.length === 0 ? (
                        <p className="text-[oklch(0.4_0_0)] text-center py-8">Açık paket yok. İlk paketi sen oluştur!</p>
                    ) : (
                        <div className="space-y-4">
                            {openPools.map(pool => (
                                <div key={pool.id} className="p-5 rounded-2xl bg-[oklch(0.1_0.01_280_/_0.5)] border border-[oklch(0.2_0.02_280_/_0.5)]">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="space-y-1">
                                            <p className="text-white font-semibold">
                                                {DESTINATIONS.find(d => d.value === pool.destination)?.label ?? pool.destination} Paketi
                                            </p>
                                            <p className="text-[oklch(0.55_0_0)] text-sm">
                                                {pool.members.length}/{pool.maxMembers} üye &bull; Kişi başı kargo: <span className="text-emerald-400 font-semibold">₺{pool.perPersonCost.toFixed(2)}</span>
                                            </p>
                                            <code className="text-xs text-[oklch(0.35_0_0)]">{pool.id}</code>
                                        </div>

                                        {(myJoinedPoolIds.includes(pool.id) || joinedPools.has(pool.id)) ? (

                                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                                                <CheckCircle className="w-4 h-4" /> Katıldın
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1 items-end">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Adınız"
                                                        value={joinNames[pool.id] || ""}
                                                        onChange={e => setJoinNames(prev => ({ ...prev, [pool.id]: e.target.value }))}
                                                        className="h-9 px-3 rounded-lg bg-[oklch(0.1_0.01_280)] border border-[oklch(0.2_0.02_280)] text-white text-sm outline-none focus:ring-1 focus:ring-[oklch(0.65_0.25_295)] placeholder:text-[oklch(0.35_0_0)]"
                                                    />
                                                    <button
                                                        onClick={() => handleJoin(pool.id)}
                                                        className="h-9 px-4 rounded-lg bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white text-sm font-semibold hover:opacity-90 flex items-center gap-1.5"
                                                    >
                                                        <LogIn className="w-3.5 h-3.5" /> Katıl
                                                    </button>
                                                </div>
                                                {joinErrors[pool.id] && (
                                                    <p className="text-red-400 text-xs">{joinErrors[pool.id]}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Üyeler ve ürünleri */}
                                    {pool.members.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[oklch(0.2_0.02_280_/_0.5)] space-y-3">
                                            {pool.members.map((m, i) => (
                                                <div key={i}>
                                                    <p className="text-[oklch(0.7_0.15_295)] text-xs font-semibold mb-1">{m.name}</p>
                                                    {m.items.length === 0 ? (
                                                        <p className="text-[oklch(0.35_0_0)] text-xs">Ürün eklenmedi</p>
                                                    ) : (
                                                        m.items.map((item, j) => (
                                                            <p key={j} className="text-[oklch(0.5_0_0)] text-xs">
                                                                • {item.name} — <span className="text-[oklch(0.65_0.25_295)]">₺{item.price}</span>
                                                            </p>
                                                        ))
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* DOLU PAKETLER — KARGOYA HAZIR */}
                {fullPools.length > 0 && (
                    <section className="p-8 rounded-3xl bg-[oklch(0.15_0.02_280_/_0.3)] backdrop-blur-xl border border-emerald-500/30">
                        <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
                            <Truck className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Kargoya Hazır Paketler</h2>
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                {fullPools.length} paket
                            </span>
                        </div>

                        <div className="space-y-4">
                            {fullPools.map(pool => (
                                <div key={pool.id} className="p-5 rounded-2xl bg-[oklch(0.1_0.01_280_/_0.5)] border border-emerald-500/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-white font-semibold">
                                                {DESTINATIONS.find(d => d.value === pool.destination)?.label ?? pool.destination} Paketi
                                            </p>
                                            <p className="text-[oklch(0.55_0_0)] text-sm">
                                                {pool.members.length} üye &bull; Kişi başı kargo: <span className="text-emerald-400 font-semibold">₺{pool.perPersonCost.toFixed(2)}</span>
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                            DOLU — Kargoya Hazır
                                        </span>
                                    </div>

                                    {/* Tüm üyelerin ürünleri */}
                                    <div className="pt-3 border-t border-emerald-500/10 space-y-3">
                                        {pool.members.map((m, i) => (
                                            <div key={i}>
                                                <p className="text-emerald-300 text-xs font-semibold mb-1">{m.name}</p>
                                                {m.items.length === 0 ? (
                                                    <p className="text-[oklch(0.35_0_0)] text-xs">Ürün eklenmedi</p>
                                                ) : (
                                                    m.items.map((item, j) => (
                                                        <p key={j} className="text-[oklch(0.5_0_0)] text-xs">
                                                            • {item.name} — <span className="text-emerald-400">₺{item.price}</span>
                                                        </p>
                                                    ))
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
